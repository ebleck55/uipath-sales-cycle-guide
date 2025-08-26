# UiPath Use Case Slide Images Setup

## Overview
The UiPath Sales Cycle Guide now supports displaying actual PDF slide images when users click on use case links. Instead of showing generic instructions, users will see the actual slide content from your use case deck.

## How It Works
- When users click on a use case, the system automatically looks for slide images in the `assets/slides/` directory
- Images should be named using the format: `page-{pageNumber}.{extension}`
- Supported formats: PNG, JPG, JPEG
- If no image is found, users see a fallback message with a "Request Slide" button

## Setting Up Slide Images

### Step 1: Extract PDF Pages as Images
You need to convert your PDF slides to individual image files. Here are several methods:

#### Method A: Online PDF to Image Converters
1. Go to a service like [PDF24](https://tools.pdf24.org/en/pdf-to-images), [SmallPDF](https://smallpdf.com/pdf-to-jpg), or [ILovePDF](https://www.ilovepdf.com/pdf_to_jpg)
2. Upload your "FINS - MAESTRO - Use Case Deck- Aug 2025.pdf"
3. Convert all pages to PNG or JPG
4. Download the images

#### Method B: Using Preview (Mac)
1. Open the PDF in Preview
2. Go to File → Export
3. Select PNG or JPEG format
4. Choose "Export All Pages"
5. This creates individual files for each page

#### Method C: Using Adobe Acrobat
1. Open PDF in Adobe Acrobat
2. Go to Tools → Export PDF
3. Select "Image" → PNG or JPEG
4. Choose "Export All Pages"
5. Click "Export"

### Step 2: Rename and Upload Images
1. Rename the extracted images to match the expected format:
   - `page-10.png` (for page 10)
   - `page-15.jpg` (for page 15)
   - `page-20.png` (for page 20)
   - etc.

2. Upload these images to the `assets/slides/` directory in your GitHub repository

### Step 3: Current Use Cases and Their Page Numbers
Based on your current use case data, you'll need images for these pages:

#### Banking Use Cases:
- **Consumer Banking Operations**: page-10.png
- **Credit Risk Assessment**: page-15.png  
- **Commercial Lending**: page-20.png
- **Trade Finance Automation**: page-25.png
- **Capital Markets Processing**: page-30.png
- **Wealth Management**: page-35.png
- **Payments Processing**: page-40.png
- **Treasury Operations**: page-45.png

#### Insurance Use Cases:
- **Claims Processing**: page-50.png
- **Underwriting**: page-52.png
- **Policy Administration**: page-54.png
- **Premium Audit**: page-56.png
- **Operations**: page-58.png
- **Regulatory Reporting**: page-58.png
- **Fraud Detection**: page-60.png
- **Risk Assessment**: page-62.png

#### IT/Finance Operations:
- **ServiceNow Integration**: page-66.png
- **System Monitoring**: page-68.png
- **Data Migration**: page-70.png
- **Invoice Processing**: page-74.png
- **Financial Reconciliation**: page-76.png
- **Expense Management**: page-78.png

## File Structure
After setup, your directory should look like this:
```
assets/
└── slides/
    ├── page-10.png
    ├── page-15.png
    ├── page-20.png
    ├── page-25.png
    ├── page-30.png
    └── ... (other pages)
```

## Testing
1. After uploading images, click on any use case in your application
2. You should see the actual slide image in a modal dialog
3. If the image doesn't appear, check:
   - File name matches exactly (e.g., `page-10.png`)
   - File is in the correct directory (`assets/slides/`)
   - File format is PNG, JPG, or JPEG

## Fallback Behavior
- If no image is found, users see a helpful message: "Slide Image Not Available"
- Users can click "Request Slide" to contact support
- Users can click "Request Details" to get more information about the use case

## Benefits
- **Professional presentation**: Show actual slide content instead of generic instructions
- **Easy sharing**: Users can right-click to save images for their presentations
- **GitHub hosting**: Images are hosted directly in your repository for reliability
- **Responsive design**: Images scale properly on all devices
- **Fast loading**: Images load quickly and cache for better performance

## Updating Images
To update or add new images:
1. Add/replace files in the `assets/slides/` directory
2. Commit and push to your GitHub repository
3. Changes are immediately available to users

## File Size Recommendations
- Keep images under 1MB each for fast loading
- PNG format provides best quality for slides with text
- JPG format is smaller for slides with photos/graphics
- Recommended resolution: 1920x1080 or similar 16:9 aspect ratio