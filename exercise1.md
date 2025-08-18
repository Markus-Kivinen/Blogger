### Some common steps in a CI setup include linting, testing, and building. What are the specific tools for taking care of these steps in the ecosystem of the language you picked? You can search for the answers by Google.
Our team has chosen to use Python for the project
For package management we rely on (uv)[https://github.com/astral-sh/uv], since it can fully replace pip, pyenv, and poetry, while making dependency and environment management significantly faster and easier.  

For linting we currently use (Flake8)[https://marketplace.visualstudio.com/items?itemName=ms-python.flake8] with mostly default settings, except the line length configured to 120 characters for better readability. For formatting, we are currently using  (Black)[https://github.com/psf/black], but are in the process of migrating to (Ruff)[https://github.com/astral-sh/ruff] because of its configurability and its ability to combine linting and formatting in one tool.  

For type checking we use (basedpyright)[https://github.com/DetachHead/basedpyright], which improves on (pyright)[https://github.com/microsoft/pyright] by fixing some of its shortcomings. By default it is also more strict, but this can be configured based on the projects needs. In the future, we are looking forward to adopting (ty)[https://github.com/astral-sh/ty] once it becomes production-ready, as astral-sh has an excellent track record and.  

Testing is handled with pytest which is the de facto standard in the Python  

### What alternatives are there to set up the CI besides Jenkins and GitHub Actions? Again, you can ask Google!  

Alternatives include GitLab CI/CD, CircleCI, Travis CI, and Azure Pipelines. Of these, GitLab CI/CD is most attractive to us, as we may choose to host our own GitLab instance, and it would integrate seamlessly with it

### Would this setup be better in a self-hosted or a cloud-based environment? Why? What information would you need to make that decision?
The project is fairly simple, and uv keeps environment management hassle-free. Packaging is lightweight and the test suite isn’t very complicated, so a self-hosted solution is a good fit for us.