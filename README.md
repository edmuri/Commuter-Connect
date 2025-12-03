<img height=200 width=1000 src="./frontend/src/assets/train.svg">

<h1 align="center">Commuter Connect: Where Every Journey Meets Community.</h1>  

<div align="center">

![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/css-%23663399.svg?style=for-the-badge&logo=css&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Firebase](https://img.shields.io/badge/firebase-a08021?style=for-the-badge&logo=firebase&logoColor=ffcd34)

</div>

---

### About

Commuter Connect is a web application built with React, Flask, Firebase, using data from Google Routes + Places API, designed to assist and connect commuter students at UIC (University of Illinois Chicago).

At UIC, a large percentage of students are commuters who face long, sometimes lonely journeys to and from campus.
Many lack a reliable network to coordinate rides, share routes, or connect with other commuters. Commuter Connect solves this problem by offering a platform that helps commuters organize and optimize their daily routes, connects students with "commute buddies" for a more convenient and social travel experience, and builds community among students who might otherwise feel isolated due to commuting.

Our mission is to turn commuting into an opportunity for connection, convenience, and community.

<p align="center">
<img src="./gif.gif">
</p>


### Key Features

*Create Route System:*
Students can create and save their fastest commute routes using Google Maps' Routes and Places API, optimized with a priority queue for fastest paths.


*Commute Buddy System:*
Add friends to your commute routes to make traveling easier and more enjoyable.

*Friend Lookup:*
Easily find and add friends using a Trie-based friend search system for fast and efficient lookups.

*Daily Commute Management:*
View, edit, and manage your saved commute routes anytime.

<p align="center">
<img src="./gif3.gif">
</p>



## How to use this project<!-- Required -->
<!-- 
* Here you may add information about how 
* 
* and why to use this project.
-->

**LINK TO API KEYS:** https://docs.google.com/document/d/1q31M4Fc75HLRCgkbx1FeDoGOIQiawCOuQS06W3nn134/edit?usp=sharing

### 1. Creating your own Project Repository
- Click on **Fork** to create your own repo and then click **Create Fork**.

### 2. Backend Installation : Python3, pip
- For Windows Users, Download Python from the [official website](https://www.python.org/downloads/). Ensure to select "Add Python to PATH" during installation.
- For Mac Users, install using Homebrew : `brew install python`
- Confirm installation by typing `python --version` and `pip --version` on Command Prompt

### 3. Frontend Installation : Nodejs and npm
- For Windows users, install [Node.js and npm LTS version](https://nodejs.org/en/download)
- For Mac users, using Homebrew `brew install node`
- Confirm installation by running `node -v` and `npm -v`

### 4. Set up Flask+React Demo locally
- Go to your Forked Repository on Github, Click on green **Code** button and copy the URL (using HTTPS or SSH)
- Open up VS Code and in the home page or under Source Control, click on **Clone a Repository**. Choose a directory to store your project on your local computer. You can also do the same from the *command line* using `git clone REPO_URL`
- You will now see a local version of all the files/source code from GitHub. 

### a. Set up Backend
Windows:  
```bash
    cd backend
    python -m venv env
    .\env\Scripts\activate
    pip install -r requirements.txt
    cd app 
    set FLASK_APP=server.py
    flask --app server.py --debug run
```  
Mac:
```bash
    cd backend
    python -m venv env
    source env/bin/activate
    pip install -r requirements.txt
    cd app 
    set FLASK_APP=server.py
    flask --app server.py --debug run
```  
 **Note:** To deactivate, run `env\Scripts\deactivate.bat` or `deactivate`


### b. Set up Frontend  
- Open up a new terminal
```bash
    cd frontend
    npm install
    npm run dev
```

## Contributors
[![Eddie](https://img.shields.io/badge/Eddie_Murillo-313030?style=for-the-badge&logo=github&logoColor=white)](https://github.com/edmuri)
[![Flori](https://img.shields.io/badge/Florianne_Che-8414CF?style=for-the-badge&logo=github&logoColor=white)](https://github.com/cheetodustflori)
[![Zeel](https://img.shields.io/badge/Zeel_Patel-147ECF?style=for-the-badge&logo=github&logoColor=white)](https://github.com/zpate6)



<!--  ## License Optional -->
<!-- 
* Here you can add project license for copyrights and distribution 
* 
* check this website for an easy reference https://choosealicense.com/)
-->
