# 🤝 Contributing to Sankalp Scoreboard

Thank you for your interest in contributing to **Sankalp Sports Fest Live Scoreboard**! As an open-source, student-led project, we welcome contributions from developers of all skill levels.

---

## 🛠️ Code of Conduct
By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to the repository maintainers.

---

## 🚀 How to Contribute

### 1. Step 1: Fork and Clone
1.  **Fork** this repository to your GitHub account.
2.  **Clone** your fork locally:
    ```bash
    git clone https://github.com/YOUR_USERNAME/sankalp_scorecard.git
    cd sankalp_scorecard
    ```

### 2. Step 2: Set Up Local Development
1.  **Backend Setup**:
    *   Navigate to the backend directory: `cd backend`
    *   Install dependencies: `npm install`
    *   Create a local configuration `.env` file (copy `.env` or set parameters) pointing to a running MongoDB instance.
    *   Seed default sports and admin data: `npm run seed`
    *   Start Node dev server: `npm run dev`
2.  **Frontend Setup**:
    *   Open a new terminal and navigate to: `cd ../frontend`
    *   Install dependencies: `npm install`
    *   Start Vite developer server: `npm run dev`

### 3. Step 3: Branching & Development Guidelines
*   Create a separate feature branch for your changes:
    ```bash
    git checkout -b feature/your-awesome-feature
    ```
*   Ensure that your code is formatted cleanly.
*   **Do not include production credentials or secrets in `.env` files committed to Git.**

---

## 📥 Submitting a Pull Request (PR)

1.  **Commit Changes**: Write clear, descriptive commit messages:
    ```bash
    git commit -m "docs: add API details to CONTRIBUTING guide"
    ```
2.  **Push to GitHub**: Push your branch changes to your forked repository:
    ```bash
    git push origin feature/your-awesome-feature
    ```
3.  **Create a Pull Request**: Go to the original repository on GitHub, click on the **Pull Requests** tab, and select **New Pull Request**.
4.  **Complete the PR Template**: Ensure all items in the pull request template checklist are completed.
5.  **Review Process**: The maintainers will review your code. Address any code review comments or feedback promptly to expedite the merge!
