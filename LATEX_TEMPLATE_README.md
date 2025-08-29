# LaTeX Template Documentation

## 📁 **Template Location**

The LaTeX template is now modularized in:
**`src/lib/latexTemplate.js`**

## 🔧 **How to Modify the Template**

### **1. Document Class & Packages**
Edit the `generateLaTeXHeader()` function to change:
- Document class options
- LaTeX packages
- Page geometry settings
- Font settings
- Color definitions

### **2. Header Section**
Edit the `generateHeader()` function to modify:
- Name formatting
- Contact information layout
- Spacing and typography

### **3. Section Formatting**
Each section type has its own function:
- `generateExperienceSection()` - Work experience entries
- `generateEducationSection()` - Education entries  
- `generateProjectsSection()` - Project entries
- `generateSkillsSection()` - Skills entries
- `generateSummary()` - Summary section

### **4. Custom Environments**
The template includes custom LaTeX environments:
- `highlights` - For bullet points
- `twocolentry` - For two-column layouts
- `onecolentry` - For single-column content
- `header` - For the header section

## 🎨 **Common Modifications**

### **Change Colors**
```javascript
// In generateLaTeXHeader()
\\definecolor{primaryColor}{RGB}{0, 0, 0} % Change to your preferred color
```

### **Change Font Size**
```javascript
// In generateHeader()
\\fontsize{25 pt}{25 pt}\\selectfont % Change font size
```

### **Modify Section Spacing**
```javascript
// In generateLaTeXHeader()
\\titlespacing{\\section}{
    -1pt  % left space
}{
    0.4 cm  % top space
}{
    0.2 cm  % bottom space
}
```

### **Add New Section Types**
1. Create a new function like `generateCustomSection()`
2. Add the section type detection in `generateSections()`
3. Call your new function

## 📋 **Template Structure**

```
latexTemplate.js
├── generateLaTeXHeader()     # Document setup & packages
├── generateHeader()          # Name & contact info
├── generateSummary()         # Summary section
├── generateSections()        # Main section router
├── generateExperienceSection() # Work experience
├── generateEducationSection()  # Education
├── generateProjectsSection()   # Projects
├── generateSkillsSection()     # Skills
└── escapeLaTeX()             # Character escaping
```

## 🔄 **Import/Export**

The template is imported in `src/lib/utils.js`:
```javascript
import { jsonToLaTeX } from './latexTemplate.js';
export { jsonToLaTeX };
```

## 🧪 **Testing Changes**

1. Make your changes to `latexTemplate.js`
2. Run `npm run build` to check for errors
3. Test the application to see your changes
4. Download a LaTeX file to verify the output

## 📝 **Example: Adding a New Section**

```javascript
// Add this function to latexTemplate.js
const generateCertificationsSection = (section) => {
  if (!section.entries || section.entries.length === 0) return '';
  
  let latex = `    \\section{${section.title}}

`;
  
  section.entries.forEach(entry => {
    latex += `        \\begin{onecolentry}
            \\textbf{${escapeLaTeX(entry.name)}} - ${escapeLaTeX(entry.issuer)}
        \\end{onecolentry}

        \\vspace{0.2 cm}

`;
  });
  
  return latex;
};

// Then add to generateSections():
} else if (section.title.toLowerCase().includes('certification')) {
  latex += generateCertificationsSection(section);
}
```

## 🎯 **Key Benefits of Modular Design**

✅ **Easy to modify** - All template code in one file  
✅ **Well organized** - Each section has its own function  
✅ **Maintainable** - Clear separation of concerns  
✅ **Testable** - Individual functions can be tested  
✅ **Reusable** - Functions can be imported elsewhere  

## 🚀 **Quick Start**

1. Open `src/lib/latexTemplate.js`
2. Find the function you want to modify
3. Make your changes
4. Save and test with `npm run build`
5. Your changes will be reflected in the generated LaTeX files!
