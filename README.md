# AI Resume Builder 🚀

A modern, AI-powered resume builder that transforms your existing resume into a compelling, ATS-friendly document. Built with Next.js, React-PDF, and dual AI provider support (Gemini & GPT).

## ✨ Features

### 🤖 **AI-Powered Content Generation**
- **Dual AI Support**: Choose between Google Gemini or OpenAI GPT
- **Smart Bullet Generation**: AI creates relevant, quantifiable bullet points
- **Cover Letter Generation**: Personalized cover letters based on job requirements
- **Skill-Based Targeting**: Generate bullets specifically for selected skills

### 📄 **Resume Processing**
- **Text Input**: Paste your resume text directly
- **Smart Parsing**: Automatically extracts sections, experience, education, projects, and skills
- **Canonical JSON**: Converts resume to structured format for easy manipulation
- **Multi-line Bullet Support**: Handles complex bullet points with continuation lines

### 🎯 **Interactive Resume Editor**
- **Toggle Bullets**: Enable/disable individual bullet points (original vs AI-generated)
- **Drag & Drop**: Reorder bullets within each section
- **Editable Skills**: Click to edit skill names and drag to reorder
- **Job Title Editing**: Modify job titles while preserving other details
- **Visual Indicators**: Clear distinction between original and AI-generated content

### 📊 **Skills Management**
- **Automatic Extraction**: AI identifies relevant skills from job descriptions
- **Categorized Skills**: Organizes skills into logical groups (Programming, Frontend, Backend, etc.)
- **Editable Categories**: Modify skill names and categories
- **Drag & Drop Reordering**: Reorder skills within categories

### 📤 **Export & Download**
- **PDF Generation**: Direct PDF export using React-PDF (no external services needed)
- **Professional Formatting**: Clean, ATS-friendly layout
- **Custom Filenames**: Automatic naming based on your name
- **High Quality**: Vector-based PDF generation

### 💾 **Session Management**
- **Auto-Save**: All changes automatically saved to localStorage
- **Session Persistence**: Resume editing where you left off
- **Clear All**: "New Resume" button clears all data and starts fresh

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Toast Notifications**: Real-time feedback for all actions
- **Loading States**: Visual feedback during AI generation and PDF creation
- **Accessible**: Full keyboard navigation and screen reader support

## 🛠 Tech Stack

### **Frontend**
- **Next.js 15** - React framework with App Router
- **React 18.3** - UI library with hooks
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **@dnd-kit** - Modern drag and drop library
- **react-hot-toast** - Toast notifications

### **AI & Processing**
- **Google Gemini API** - Primary AI provider
- **OpenAI GPT API** - Alternative AI provider
- **@react-pdf/renderer** - PDF generation from React components
- **uuid** - Unique ID generation

### **Development**
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate-documents/     # AI generation endpoint
│   ├── globals.css                 # Global styles
│   ├── layout.js                   # Root layout
│   └── page.js                     # Main application
├── components/
│   ├── ui/                         # Reusable UI components
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── Textarea.js
│   │   ├── ToggleSwitch.js
│   │   └── Checkbox.js
│   ├── ResumeInputForm.js          # Resume input interface
│   ├── SkillChecklist.js           # Skill selection
│   ├── ResumeEditor.js             # Main editor with drag/drop
│   ├── ResumeJSONViewer.js         # JSON preview
│   ├── GeneratedCoverLetter.js     # Cover letter display
│   └── ResumeTemplate.js           # PDF template
├── context/
│   └── AppContext.js               # Global state management
├── lib/
│   ├── ai/
│   │   ├── index.js                # AI client factory
│   │   ├── gemini.js               # Gemini client
│   │   └── gpt.js                  # GPT client
│   ├── utils.js                    # Utility functions
│   └── exports.js                  # Centralized exports
└── styles/
    └── globals.css                 # Additional styles
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** (recommended: Node.js 20+)
- **npm** or **yarn**
- **AI API Key**: Either Gemini or OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yash9933/GenCV.git
cd GenCV
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Create .env.local file
cp .env.example .env.local

# Add your API keys (at least one required)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional
```

4. **Start development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### **Step 1: Input Your Information**
1. **Job Description**: Paste the job posting you're applying for
2. **Resume Text**: Either paste your resume text or upload a file
3. **Extract Skills**: Click "Extract Skills & Continue" to analyze the job

### **Step 2: Select Target Skills**
1. **Review Skills**: AI suggests relevant skills from the job description
2. **Customize Selection**: Check/uncheck skills you want to highlight
3. **Generate Content**: Click "Generate Documents" to create AI bullets

### **Step 3: Customize Your Resume**
1. **Toggle Bullets**: Use switches to enable/disable individual bullets
   - **Original bullets**: Enabled by default (blue border)
   - **AI bullets**: Disabled by default (yellow border)
2. **Reorder Content**: Drag and drop bullets to change their order
3. **Edit Skills**: Click skill names to edit them
4. **Edit Job Titles**: Click job titles to modify them

### **Step 4: Export Your Resume**
1. **Download PDF**: Click "Download PDF" to get your final resume
2. **Review**: Check the generated PDF for formatting and content
3. **Start Fresh**: Use "New Resume" to clear all data and begin again

## ⚙️ Configuration

### **AI Provider Selection**

The app automatically selects the best available AI provider:

| Available Keys | Selected Provider | Behavior |
|----------------|------------------|----------|
| `GEMINI_API_KEY` only | Gemini | Uses Gemini for all generation |
| `OPENAI_API_KEY` only | GPT | Uses GPT for all generation |
| Both keys | GPT | Prefers GPT, falls back to Gemini |
| No keys | Error | Shows clear error message |

### **Environment Variables**

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes* | - |
| `OPENAI_API_KEY` | OpenAI API key | Yes* | - |

*At least one AI provider key is required.

### **Customization Options**

#### **PDF Template**
- Edit `src/components/ResumeTemplate.js` to modify PDF styling
- Change fonts, colors, spacing, and layout
- Add custom sections or modify existing ones

#### **AI Prompts**
- Modify prompts in `src/lib/ai/gemini.js` or `src/lib/ai/gpt.js`
- Adjust tone, style, and content generation rules
- Customize bullet point generation criteria

#### **UI Components**
- All UI components are in `src/components/ui/`
- Modify styling using Tailwind CSS classes
- Add new components following existing patterns

## 🚀 Deployment

### **Vercel (Recommended)**
1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### **Other Platforms**
- **Netlify**: Supports Next.js with build commands
- **Railway**: Easy deployment with environment variable support
- **DigitalOcean App Platform**: Production-ready deployment
- **AWS Amplify**: Enterprise-grade hosting

## 🔧 Development

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### **Code Structure**
- **Components**: Modular, reusable React components
- **Context**: Global state management with useReducer
- **Utils**: Pure functions for data processing
- **AI**: Abstracted AI provider interface

### **Adding New Features**
1. Create components in `src/components/`
2. Add utilities to `src/lib/utils.js`
3. Update context in `src/context/AppContext.js`
4. Add API endpoints in `src/app/api/`

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### **Development Guidelines**
- Follow existing code patterns and naming conventions
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check this README and inline code comments

## 🗺 Roadmap

### **Planned Features**
- [ ] **Multiple Resume Templates**: Choose from different PDF styles
- [ ] **DOCX Export**: Download as Word document
- [ ] **Resume Scoring**: AI-powered resume quality assessment
- [ ] **ATS Optimization**: Advanced keyword optimization
- [ ] **Cover Letter Templates**: Multiple cover letter styles
- [ ] **User Accounts**: Save and manage multiple resumes
- [ ] **Collaboration**: Share resumes with team members
- [ ] **Analytics**: Track application success rates

### **Technical Improvements**
- [ ] **Performance**: Optimize PDF generation speed
- [ ] **Caching**: Implement intelligent caching for AI responses
- [ ] **Testing**: Add comprehensive test suite
- [ ] **Internationalization**: Multi-language support
- [ ] **Accessibility**: Enhanced screen reader support

## 🙏 Acknowledgments

- **Google Gemini** for AI capabilities
- **OpenAI** for alternative AI provider
- **@dnd-kit** for excellent drag and drop functionality
- **@react-pdf/renderer** for PDF generation
- **Tailwind CSS** for beautiful, responsive design

---

**Made with ❤️ for job seekers everywhere**

