# Contributing to Antigravity CMS

Thank you for your interest in contributing to Antigravity CMS! We welcome contributions from everyone.

## Code of Conduct

Please note that this project is released with a Contributor Code of Conduct. By participating in this project you agree to abide by its terms. Be respectful and inclusive.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/your-username/antigravity-cms.git
    cd antigravity-cms
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    cd functions && npm install && cd ..
    ```
4.  **Set up Environment Variables**:
    Copy `.env.example` to `.env.local` and fill in your Firebase credentials.
    *(See README.md for detailed setup instructions)*

## Development Workflow

1.  Create a new branch for your feature or fix:
    ```bash
    git checkout -b feature/amazing-feature
    ```
2.  Run the development server:
    ```bash
    npm run dev
    ```
3.  Make your changes.
4.  Commit your changes with descriptive messages.
5.  Push to your fork and submit a Pull Request.

## Pull Request Process

1.  Ensure your code builds and runs locally.
2.  Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3.  The PR will be reviewed by the maintainers.

## Reporting Bugs

Please use the Bug Report template when filing issues. Include as much detail as possible, including steps to reproduce, expected behavior, and screenshots if applicable.
