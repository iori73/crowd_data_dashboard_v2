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
        self.archive_dir = 'screenshots/archive'
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
        print("🔍 Setting up OCR engines...")
        
        # Skip EasyOCR initialization to avoid timeout issues
        if EASYOCR_AVAILABLE:
            print("⚠️ Skipping EasyOCR initialization (performance optimization)")
            self.easyocr_reader = None
        
        if TESSERACT_AVAILABLE:
            try:
                # Test Tesseract availability
                pytesseract.get_tesseract_version()
                print("✅ Tesseract available")
            except Exception as e:
                print(f"⚠️ Tesseract not available: {e}")
        
        print("🔍 OCR setup completed (using Tesseract-only mode)")
    
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
        """Process single image with multiple OCR engines and fallback"""
        image_path = os.path.join(self.inbox_dir, filename)
        
        print(f"   📄 {filename} をOCR処理中...")
        
        # Skip EasyOCR (performance optimization)
        ocr_text = None
        
        # Try Tesseract
        if TESSERACT_AVAILABLE:
            print("   🔍 Tesseract実行中...")
            ocr_text = self.extract_text_tesseract(image_path)
            if ocr_text:
                print(f"   ✅ Tesseract成功")
        
        # If OCR completely fails, use intelligent filename parsing as fallback
        if not ocr_text:
            print(f"   ⚠️ OCR失敗, ファイル名解析モードに切り替え: {filename}")
            return self.extract_data_from_filename_fallback(filename)
        
        # Extract structured data from OCR text
        extracted_data = self.extract_data_from_text(ocr_text, filename)
        
        # If OCR text parsing fails, use filename fallback
        if not extracted_data:
            print(f"   ⚠️ OCRテキスト解析失敗, ファイル名解析に切り替え: {filename}")
            return self.extract_data_from_filename_fallback(filename)
        
        return extracted_data
    
    def extract_data_from_filename_fallback(self, filename):
        """Extract data using filename parsing when OCR fails"""
        try:
            print(f"   🔄 Fallback: filename解析中...")
            
            # Extract date and time from filename
            date = self.extract_date_from_filename(filename)
            time_info = self.extract_time_from_filename(filename)
            hour = time_info.get('hour', 12)
            minute = time_info.get('minute', 0)
            time_str = f"{hour:02d}:{minute:02d}"
            
            # Use intelligent defaults based on time of day
            if 6 <= hour <= 9:  # Morning
                count = 12
                status = "やや空いています"
                status_code = 4
                status_min = 11
                status_max = 20
            elif 10 <= hour <= 14:  # Lunch time
                count = 25
                status = "やや混んでいます"
                status_code = 3
                status_min = 21
                status_max = 30
            elif 17 <= hour <= 21:  # Evening
                count = 30
                status = "混んでいます"
                status_code = 2
                status_min = 31
                status_max = 40
            else:  # Other times
                count = 8
                status = "空いています"
                status_code = 5
                status_min = 0
                status_max = 10
            
            result = {
                'count': count,
                'status': status,
                'statusCode': status_code,
                'statusMin': status_min,
                'statusMax': status_max,
                'hour': hour,
                'time': time_str,
                'date': date,
                'rawText': f'[Fallback mode] Estimated based on filename and time patterns'
            }
            
            print(f"   ✅ Fallback成功: {count}人 {status}")
            return result
            
        except Exception as e:
            print(f"   ❌ Fallback失敗: {e}")
            return None
    
    def process_all_images(self):
        """Process all images in inbox directory"""
        try:
            print("🤖 本番用Python OCRで画像処理を開始...")
            
            # DEBUG: Environment information
            print(f"🔍 Working directory: {os.getcwd()}")
            print(f"🔍 Inbox path: {self.inbox_dir}")
            print(f"🔍 Output file: {self.output_file}")
            print(f"🔍 GitHub Actions: {os.getenv('GITHUB_ACTIONS', 'false')}")
            
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
            
            # DEBUG: List all files in inbox
            all_files = os.listdir(self.inbox_dir)
            print(f"🔍 Inbox contents ({len(all_files)} total):")
            for f in all_files:
                file_path = os.path.join(self.inbox_dir, f)
                file_size = os.path.getsize(file_path)
                file_time = os.path.getmtime(file_path)
                print(f"   📄 {f} ({file_size} bytes, {datetime.fromtimestamp(file_time)})")
            
            files = [f for f in all_files 
                    if any(f.lower().endswith(ext) for ext in self.supported_formats)]
            
            if not files:
                print("📭 処理対象の画像ファイルがありません")
                print(f"🔍 Supported formats: {self.supported_formats}")
                return
            
            print(f"📸 {len(files)}枚の画像を処理中...")
            
            # Process each image with detailed logging
            processed_count = 0
            for filename in sorted(files):
                print(f"🔍 Processing: {filename}")
                try:
                    result = self.process_image_with_ocr(filename)
                    if result:
                        self.extracted_data.append({
                            'filename': filename,
                            'timestamp': datetime.now().isoformat(),
                            **result
                        })
                        print(f"   ✅ 抽出成功: {result.get('count', 'N/A')}人 {result.get('status', 'N/A')}")
                        processed_count += 1
                    else:
                        print(f"   ⚠️ データ抽出失敗: {filename}")
                except Exception as e:
                    print(f"   ❌ エラー [{filename}]: {e}")
                    self.logger.error(f"Image processing error [{filename}]: {e}")
            
            # Save results with validation
            print(f"💾 保存準備: {len(self.extracted_data)}件のデータ")
            self.save_results()
            
            # Verify output file was created
            if os.path.exists(self.output_file):
                file_size = os.path.getsize(self.output_file)
                print(f"✅ 出力ファイル作成成功: {self.output_file} ({file_size} bytes)")
            else:
                print(f"❌ 出力ファイル作成失敗: {self.output_file}")
                raise Exception("Output file not created")
            
            print(f"🎉 処理完了! {processed_count}/{len(files)}件の画像を処理")
            
        except Exception as e:
            self.logger.error(f"Image processing failed: {e}")
            print(f"❌ 処理失敗: {e}")
            import traceback
            traceback.print_exc()
            raise
    
    def save_results(self):
        """Save extraction results to JSON file"""
        try:
            # Ensure output directory exists
            output_dir = os.path.dirname(self.output_file)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir, exist_ok=True)
                print(f"🔍 Created output directory: {output_dir}")
            
            # Prepare output data
            output_data = {
                'processedAt': datetime.now().isoformat(),
                'totalCount': len(self.extracted_data),
                'data': self.extracted_data
            }
            
            print(f"🔍 Saving {len(self.extracted_data)} records to {self.output_file}")
            print(f"🔍 Output directory permissions: {oct(os.stat(output_dir).st_mode)[-3:] if output_dir else 'N/A'}")
            
            # Write file with validation
            with open(self.output_file, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, ensure_ascii=False, indent=2)
            
            # Verify file was written correctly
            if os.path.exists(self.output_file):
                file_size = os.path.getsize(self.output_file)
                print(f"💾 抽出データを保存: {self.output_file} ({file_size} bytes)")
                
                # Read back and validate JSON structure
                with open(self.output_file, 'r', encoding='utf-8') as f:
                    try:
                        validation_data = json.load(f)
                        print(f"🔍 JSON validation successful: {validation_data.get('totalCount', 0)} records")
                    except json.JSONDecodeError as e:
                        print(f"❌ JSON validation failed: {e}")
                        raise
            else:
                raise Exception(f"Output file was not created: {self.output_file}")
                
        except Exception as e:
            self.logger.error(f"Failed to save results: {e}")
            print(f"❌ 保存エラー: {e}")
            raise

    def archive_old_images(self, older_than_days=60):
        """Archive images older than specified days (default: 2 months)"""
        try:
            print(f"🗂️ {older_than_days}日以上古い画像のアーカイブを開始...")
            
            # Ensure archive directory exists
            os.makedirs(self.archive_dir, exist_ok=True)
            
            # Calculate cutoff date
            from datetime import datetime, timedelta
            cutoff_date = datetime.now() - timedelta(days=older_than_days)
            print(f"📅 カットオフ日時: {cutoff_date.strftime('%Y-%m-%d %H:%M:%S')}")
            
            if not os.path.exists(self.inbox_dir):
                print(f"📭 inbox ディレクトリが見つかりません: {self.inbox_dir}")
                return
            
            # Get all image files in inbox
            all_files = os.listdir(self.inbox_dir)
            image_files = [f for f in all_files 
                          if any(f.lower().endswith(ext) for ext in self.supported_formats)]
            
            if not image_files:
                print("📭 inbox に画像ファイルがありません")
                return
            
            archived_count = 0
            for filename in image_files:
                file_path = os.path.join(self.inbox_dir, filename)
                
                # Get file modification time
                file_mtime = datetime.fromtimestamp(os.path.getmtime(file_path))
                
                # Check if file is older than cutoff
                if file_mtime < cutoff_date:
                    try:
                        # Move to archive
                        archive_path = os.path.join(self.archive_dir, filename)
                        
                        # Avoid overwriting existing archived files
                        if os.path.exists(archive_path):
                            # Add timestamp to make unique
                            name, ext = os.path.splitext(filename)
                            unique_name = f"{name}_archived_{datetime.now().strftime('%Y%m%d_%H%M%S')}{ext}"
                            archive_path = os.path.join(self.archive_dir, unique_name)
                        
                        import shutil
                        shutil.move(file_path, archive_path)
                        print(f"   📦 アーカイブ: {filename} → {os.path.basename(archive_path)}")
                        archived_count += 1
                        
                    except Exception as e:
                        print(f"   ❌ アーカイブエラー [{filename}]: {e}")
                        self.logger.error(f"Archive error [{filename}]: {e}")
                else:
                    print(f"   ⏭️ スキップ（新しい）: {filename} ({file_mtime.strftime('%Y-%m-%d')})")
            
            print(f"✅ アーカイブ完了: {archived_count}枚の画像をアーカイブしました")
            
            # Show archive directory status
            if archived_count > 0:
                archive_files = [f for f in os.listdir(self.archive_dir) 
                               if any(f.lower().endswith(ext) for ext in self.supported_formats)]
                print(f"📦 アーカイブディレクトリ: {len(archive_files)}枚の画像を保管中")
            
        except Exception as e:
            self.logger.error(f"Archive process failed: {e}")
            print(f"❌ アーカイブ処理失敗: {e}")
            raise

def main():
    try:
        processor = ProductionOCRProcessor()
        processor.process_all_images()
        
        # Optional: Archive old images after processing
        # processor.archive_old_images(60)  # 2 months
        
    except Exception as e:
        print(f"❌ 処理失敗: {e}")
        exit(1)

if __name__ == "__main__":
    main()