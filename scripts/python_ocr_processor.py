#!/usr/bin/env python3
"""
Production-ready Python OCR processor for My Gym screenshots
Integrates EasyOCR and Tesseract for reliable text extraction
"""

import os
import json
import cv2
import numpy as np
from pathlib import Path
import re
from datetime import datetime
import logging

# OCR libraries
try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False
    print("⚠️ EasyOCR not available, falling back to Tesseract only")

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    print("⚠️ Tesseract not available")

class ProductionOCRProcessor:
    def __init__(self):
        self.inbox_dir = 'screenshots/inbox'
        self.output_file = 'scripts/extracted-data.json'
        self.icloud_path = os.path.expanduser('~/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym')
        self.extracted_data = []
        self.supported_formats = ['.png', '.jpg', '.jpeg', '.bmp', '.tiff']
        
        # Initialize OCR readers
        self.easyocr_reader = None
        self.setup_ocr()
        
        # Setup logging
        logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
        self.logger = logging.getLogger(__name__)
        
    def setup_ocr(self):
        """Initialize OCR engines"""
        if EASYOCR_AVAILABLE:
            try:
                self.easyocr_reader = easyocr.Reader(['ja', 'en'], gpu=False)
                print("✅ EasyOCR initialized (Japanese + English)")
            except Exception as e:
                print(f"⚠️ EasyOCR initialization failed: {e}")
                self.easyocr_reader = None
        
        if TESSERACT_AVAILABLE:
            try:
                # Test Tesseract availability
                pytesseract.get_tesseract_version()
                print("✅ Tesseract available")
            except Exception as e:
                print(f"⚠️ Tesseract not available: {e}")
    
    def collect_from_icloud(self):
        """Collect images from iCloud and copy to inbox"""
        try:
            print("☁️ iCloudからの画像収集を開始...")
            
            if not os.path.exists(self.icloud_path):
                print(f"⚠️ iCloudパスが見つかりません: {self.icloud_path}")
                return
            
            # Find My Gym images
            icloud_files = []
            for file in os.listdir(self.icloud_path):
                if any(file.lower().endswith(ext) for ext in self.supported_formats):
                    if 'FP24' in file or '2025:' in file or 'fit' in file.lower():
                        icloud_files.append(file)
            
            if not icloud_files:
                print("📭 iCloudに新しいMy Gym画像がありません")
                return
                
            print(f"☁️ iCloudで{len(icloud_files)}枚のMy Gym画像を発見")
            
            # Ensure inbox directory exists
            os.makedirs(self.inbox_dir, exist_ok=True)
            
            # Copy files from iCloud to inbox
            copied_count = 0
            for file in icloud_files:
                source_path = os.path.join(self.icloud_path, file)
                dest_path = os.path.join(self.inbox_dir, file)
                
                if os.path.exists(dest_path):
                    print(f"   ⏭️ スキップ（既存）: {file}")
                    continue
                
                try:
                    import shutil
                    shutil.copy2(source_path, dest_path)
                    print(f"   📋 コピー完了: {file}")
                    copied_count += 1
                except Exception as e:
                    print(f"   ❌ コピーエラー [{file}]: {e}")
            
            print(f"✅ iCloud収集完了: {copied_count}枚の新しい画像をコピー")
            
        except Exception as e:
            print(f"❌ iCloud収集エラー: {e}")
            self.logger.error(f"iCloud collection failed: {e}")
    
    def preprocess_image(self, image_path):
        """Preprocess image for better OCR accuracy"""
        try:
            # Read image
            img = cv2.imread(image_path)
            if img is None:
                return None
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Apply denoising
            denoised = cv2.fastNlMeansDenoising(gray)
            
            # Apply contrast enhancement
            enhanced = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8)).apply(denoised)
            
            return enhanced
            
        except Exception as e:
            self.logger.error(f"Image preprocessing failed for {image_path}: {e}")
            return None
    
    def extract_text_easyocr(self, image_path):
        """Extract text using EasyOCR"""
        if not self.easyocr_reader:
            return None
            
        try:
            # Preprocess image
            processed_img = self.preprocess_image(image_path)
            if processed_img is None:
                processed_img = image_path
            
            # Extract text
            results = self.easyocr_reader.readtext(processed_img)
            
            # Combine all text
            text_parts = []
            for (bbox, text, confidence) in results:
                if confidence > 0.5:  # Filter low confidence results
                    text_parts.append(text)
            
            combined_text = ' '.join(text_parts)
            return combined_text
            
        except Exception as e:
            self.logger.error(f"EasyOCR failed for {image_path}: {e}")
            return None
    
    def extract_text_tesseract(self, image_path):
        """Extract text using Tesseract"""
        if not TESSERACT_AVAILABLE:
            return None
            
        try:
            # Preprocess image
            processed_img = self.preprocess_image(image_path)
            if processed_img is None:
                return None
            
            # Configure Tesseract for Japanese
            custom_config = r'--oem 3 --psm 6 -l jpn+eng'
            text = pytesseract.image_to_string(processed_img, config=custom_config)
            
            return text.strip()
            
        except Exception as e:
            self.logger.error(f"Tesseract failed for {image_path}: {e}")
            return None
    
    def extract_data_from_text(self, ocr_text, filename):
        """Extract structured data from OCR text"""
        try:
            if not ocr_text:
                return None
            
            print(f"   🔍 OCR結果: \"{ocr_text}\"")
            
            # Extract count (人数)
            count_patterns = [
                r'(\d{1,2})人',
                r'(\d{1,2})\s*人',
                r'利用者数\s*(\d{1,2})',
                r'現在\s*(\d{1,2})',
            ]
            
            count = None
            for pattern in count_patterns:
                match = re.search(pattern, ocr_text)
                if match:
                    count = int(match.group(1))
                    break
            
            # Extract status
            status = None
            status_code = None
            status_min = 0
            status_max = 0
            
            status_patterns = [
                ('空いています', 5, 0, 10),
                ('やや空いています', 4, 11, 20),
                ('やや混んでいます', 3, 21, 30),
                ('混んでいます', 2, 31, 40),
                ('空い', 5, 0, 10),
                ('やや空い', 4, 11, 20),
                ('やや混ん', 3, 21, 30),
                ('混ん', 2, 31, 40),
            ]
            
            for status_text, code, min_val, max_val in status_patterns:
                if status_text in ocr_text:
                    status = f"{status_text}（~{max_val}人）"
                    status_code = code
                    status_min = min_val
                    status_max = max_val
                    break
            
            # Extract time
            time_patterns = [
                r'(\d{1,2}):(\d{2})',
                r'(\d{1,2})\.(\d{2})',
                r'(\d{1,2})時(\d{2})分',
            ]
            
            hour = None
            minute = None
            for pattern in time_patterns:
                match = re.search(pattern, ocr_text)
                if match:
                    hour = int(match.group(1))
                    minute = int(match.group(2))
                    break
            
            # Extract date from filename
            date = self.extract_date_from_filename(filename)
            
            # Fallback time from filename if not found in OCR
            if hour is None:
                time_info = self.extract_time_from_filename(filename)
                hour = time_info.get('hour')
                minute = time_info.get('minute', 0)
            
            # Validate extracted data
            if count is None or status is None or hour is None:
                print(f"   ⚠️ 必要なデータが不足: count={count}, status={status}, hour={hour}")
                return None
            
            time_str = f"{hour:02d}:{minute:02d}"
            
            return {
                'count': count,
                'status': status,
                'statusCode': status_code,
                'statusMin': status_min,
                'statusMax': status_max,
                'hour': hour,
                'time': time_str,
                'date': date,
                'rawText': ocr_text
            }
            
        except Exception as e:
            self.logger.error(f"Data extraction failed for {filename}: {e}")
            return None
    
    def extract_date_from_filename(self, filename):
        """Extract date from filename"""
        # FP24_20250815_222321.png format
        date_match = re.search(r'(\d{4})(\d{2})(\d{2})', filename)
        if date_match:
            year, month, day = date_match.groups()
            return f"{year}-{month}-{day}"
        
        # 2025:08:15 format
        date_match = re.search(r'(\d{4})[:\-](\d{2})[:\-](\d{2})', filename)
        if date_match:
            year, month, day = date_match.groups()
            return f"{year}-{month}-{day}"
        
        # Fallback to current date
        return datetime.now().strftime('%Y-%m-%d')
    
    def extract_time_from_filename(self, filename):
        """Extract time from filename"""
        # FP24_20250815_222321.png format
        time_match = re.search(r'_(\d{2})(\d{2})(\d{2})\.', filename)
        if time_match:
            hour, minute, second = time_match.groups()
            return {'hour': int(hour), 'minute': int(minute)}
        
        # 2025:08:15, 22:23.png format  
        time_match = re.search(r'(\d{2}):(\d{2})\.', filename)
        if time_match:
            hour, minute = time_match.groups()
            return {'hour': int(hour), 'minute': int(minute)}
        
        return {'hour': 12, 'minute': 0}  # Default fallback
    
    def process_image_with_ocr(self, filename):
        """Process single image with multiple OCR engines"""
        image_path = os.path.join(self.inbox_dir, filename)
        
        print(f"   📄 {filename} をOCR処理中...")
        
        # Try EasyOCR first
        ocr_text = None
        if EASYOCR_AVAILABLE:
            print("   🔍 EasyOCR実行中...")
            ocr_text = self.extract_text_easyocr(image_path)
            if ocr_text:
                print(f"   ✅ EasyOCR成功")
        
        # Fallback to Tesseract if EasyOCR failed
        if not ocr_text and TESSERACT_AVAILABLE:
            print("   🔍 Tesseract実行中...")
            ocr_text = self.extract_text_tesseract(image_path)
            if ocr_text:
                print(f"   ✅ Tesseract成功")
        
        if not ocr_text:
            print(f"   ❌ OCR処理失敗: {filename}")
            return None
        
        # Extract structured data
        extracted_data = self.extract_data_from_text(ocr_text, filename)
        
        return extracted_data
    
    def process_all_images(self):
        """Process all images in inbox directory"""
        try:
            print("🤖 本番用Python OCRで画像処理を開始...")
            
            # Skip iCloud collection in GitHub Actions (handled by launchd locally)
            if os.getenv('GITHUB_ACTIONS') != 'true':
                print("🏠 ローカル環境: iCloud収集を実行中...")
                self.collect_from_icloud()
            else:
                print("☁️ GitHub Actions環境: iCloud収集をスキップ（launchdで処理済み）")
            
            # Get all image files
            if not os.path.exists(self.inbox_dir):
                print(f"📭 inboxディレクトリが見つかりません: {self.inbox_dir}")
                return
            
            files = [f for f in os.listdir(self.inbox_dir) 
                    if any(f.lower().endswith(ext) for ext in self.supported_formats)]
            
            if not files:
                print("📭 処理対象の画像ファイルがありません")
                return
            
            print(f"📸 {len(files)}枚の画像を処理中...")
            
            # Process each image
            for filename in sorted(files):
                result = self.process_image_with_ocr(filename)
                if result:
                    self.extracted_data.append({
                        'filename': filename,
                        'timestamp': datetime.now().isoformat(),
                        **result
                    })
                    print(f"   ✅ 抽出成功: {result['count']}人 {result['status']}")
                else:
                    print(f"   ⚠️ データ抽出失敗: {filename}")
            
            # Save results
            self.save_results()
            print(f"🎉 処理完了! {len(self.extracted_data)}件のデータを抽出")
            
        except Exception as e:
            self.logger.error(f"Image processing failed: {e}")
            raise
    
    def save_results(self):
        """Save extraction results to JSON file"""
        output_data = {
            'processedAt': datetime.now().isoformat(),
            'totalCount': len(self.extracted_data),
            'data': self.extracted_data
        }
        
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, ensure_ascii=False, indent=2)
        
        print(f"💾 抽出データを保存: {self.output_file}")

def main():
    try:
        processor = ProductionOCRProcessor()
        processor.process_all_images()
    except Exception as e:
        print(f"❌ 処理失敗: {e}")
        exit(1)

if __name__ == "__main__":
    main()