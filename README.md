# AI Resume Builder

A modern, AI-powered resume and cover letter generator built with Next.js, Tailwind CSS, and Gemini AI. This application helps users create human-like, ATS-friendly documents that stand out to hiring managers.

## Features

- **AI-Powered Generation**: Uses Gemini AI to generate personalized resume bullets and cover letters
- **PDF Upload Support**: Upload and parse PDF resumes directly
- **Skill Extraction**: Automatically extracts relevant skills from job descriptions
- **Modular Bullet Points**: Toggle individual generated bullets on/off
- **Drag & Drop**: Reorder generated bullets to customize your resume
- **Multiple Export Formats**: Download as PDF or DOCX
- **Responsive Design**: Works on desktop and tablet devices
- **Toast Notifications**: User-friendly feedback for all actions
- **Modular AI Drivers**: Easy switching between Gemini and GPT APIs

## Tech Stack

- **Frontend**: Next.js 15, React 18.3, Tailwind CSS 3.4
- **AI**: Google Gemini API (with GPT-4 as alternative)
- **File Processing**: PDF.js for client-side PDF extraction
- **Drag & Drop**: @dnd-kit (modern, accessible, well-maintained)
- **Notifications**: react-hot-toast
- **Styling**: Tailwind CSS with custom components

## Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate-documents/ # AI generation endpoint
│   │   ├── page.js                 # Main application component
│   │   └── layout.js               # Root layout with providers
│   ├── components/
│   │   ├── ui/                     # Reusable UI components
│   │   ├── layouts/                # Layout components
│   │   ├── ResumeInputForm.js      # Job description & resume input
│   │   ├── SkillChecklist.js       # Skill selection interface
│   │   ├── GeneratedResumeView.js  # Resume with toggle switches
│   │   └── GeneratedCoverLetter.js # Cover letter display
│   ├── context/
│   │   └── AppContext.js           # Global state management
│   ├── lib/
│   │   ├── ai/                     # AI client drivers
│   │   └── utils.js                # Utility functions
│   └── styles/
│       └── globals.css             # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: Node.js 20+)
- npm or yarn
- Gemini API key (or OpenAI API key for GPT)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-resume-builder
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Add your API key to `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Step 1: Input Job Description and Resume
- Paste the job description in the first text area
- Upload a PDF resume or paste resume text in the second text area
- Click "Extract Skills & Continue"

### Step 2: Select Skills
- Review the automatically extracted skills from the job description
- Select/deselect skills you want to highlight
- Click "Generate Documents"

### Step 3: Review and Customize
- View your original resume on the left
- Review generated bullet points on the right
- Toggle bullets on/off using the switches
- Drag and drop bullets to reorder them
- Download your customized resume and cover letter

## API Configuration

### Switching AI Providers

The application supports both Gemini and GPT APIs. To switch providers:

1. **For Gemini (default)**: Set `GEMINI_API_KEY` in your environment
2. **For GPT**: Set `OPENAI_API_KEY` and change the provider in `src/app/api/generate-documents/route.js`:

```javascript
// Change this line in the API route
const aiProvider = 'gpt'; // instead of 'gemini'
```

### API Endpoints

- `POST /api/generate-documents`: Generates resume bullets and cover letter
  - Body: `{ jobDescription, resumeText, selectedSkills }`
  - Returns: `{ suggestedSkills, rewrittenBullets, coverLetter }`

## Customization

### Styling
- Modify `src/styles/globals.css` for custom styles
- All components use Tailwind CSS classes
- Custom CSS classes are defined in the global stylesheet

### AI Prompts
- Edit prompts in `src/lib/ai/gemini.js` or `src/lib/ai/gpt.js`
- Modify the `buildPrompt` function to change AI behavior

### Components
- All components are modular and reusable
- UI components are in `src/components/ui/`
- Main feature components are in `src/components/`

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes (for Gemini) |
| `OPENAI_API_KEY` | OpenAI API key | Yes (for GPT) |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Roadmap

- [ ] DOCX file upload support
- [ ] Resume template selection
- [ ] Multiple language support
- [ ] Advanced ATS optimization
- [ ] Resume scoring and feedback
- [ ] Integration with job boards
- [ ] User accounts and history
- [ ] Team collaboration features

