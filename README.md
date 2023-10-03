# Code Translator powered by watsonx.ai

This monorepo contains a full-stack application for a Code Translator built with React for the frontend and FastAPI in Python for the backend. The application utilizes the power of **watsonx.ai**. In this specific instance, we employ one of the code fine-tuned Language Models (LLM) to translate code from one programming language to another.

## Features

- Translate code from one programming language to another.
- Utilizes Language Models on watsonx.ai.
- Responsive and user-friendly web interface built with React and Carbon Design.
- Scalable FastAPI backend to handle translation requests.
- Easy-to-use and deployable monorepo structure.

## Todos
- [ ] Add additional watsonx.ai instances besides BAM
- [ ] Get saved prompts from watsonx.ai and built view to select them
- [ ] Detect language, also using an LLM

## Installation

Before getting started, ensure that you have Node.js and Python installed on your system.

1. Clone the repository:

   ```bash
   git clone git@github.ibm.com:Sinan-Oezguen/code-translator.git
   cd code-translator
   ```

2. Install frontend dependencies:

   ```bash
   cd frontend
   yarn install
   ```

3. Install backend dependencies:

   ```bash
   cd ../backend
   pip install -r requirements.txt
   ```

## Usage

1. Start the FastAPI backend:

   ```bash
   cd backend
   python main.py
   ```

2. Start the React frontend:

   ```bash
   cd ../frontend
   yarn dev
   ```

3. Access the application in your web browser at `http://localhost:5173`.


## Acknowledgments

- This project utilizes the power of [watsonx.ai](https://watsonx.ai/) for code translation. Currently the internal [BAM version](https://bam.res.ibm.com/) is being used. Therefore, please only use it for internal purposes for now.
- The frontend is built with [React](https://reactjs.org/), [Vite](https://vitejs.dev/) and [Carbon Design System](https://www.carbondesignsystem.com/).
- The backend is powered by [FastAPI](https://fastapi.tiangolo.com/).

## Contributing

I welcome contributions! If you'd like to improve this Code Translator or fix any issues, please fork this repository and create a pull request.

## Contact

If you have any questions or need assistance, feel free to contact us at [sinan.oezguen@ibm.com](mailto:sinan.oezguen@ibm.com).

Happy coding! 🚀
