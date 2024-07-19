"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var App;
(function (App) {
    // Component base class
    class Component {
        constructor(temlplateId, hostElId, insertAtStart, newElId) {
            this.templateEl = document.getElementById(temlplateId);
            this.hostEl = document.getElementById(hostElId);
            const importedNode = document.importNode(this.templateEl.content, true);
            this.element = importedNode.firstElementChild;
            if (newElId) {
                this.element.id = newElId;
            }
            this.attach(insertAtStart);
        }
        attach(insertAtBeginning) {
            this.hostEl.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element);
        }
    }
    App.Component = Component;
})(App || (App = {}));
var App;
(function (App) {
    function validate(validatableInput) {
        let isValid = true;
        if (validatableInput.required) {
            isValid = isValid && validatableInput.value.toString().trim().length !== 0;
        }
        if (validatableInput.maxLength != null &&
            typeof validatableInput.value == 'string') {
            isValid =
                isValid && validatableInput.value.length < validatableInput.maxLength;
        }
        if (validatableInput.minLength != null &&
            typeof validatableInput.value == 'string') {
            isValid =
                isValid && validatableInput.value.length > validatableInput.minLength;
        }
        if (validatableInput.max != null && typeof validatableInput.value === 'number') {
            isValid = isValid && validatableInput.value < validatableInput.max;
        }
        if (validatableInput.min != null && typeof validatableInput.value === 'number') {
            isValid = isValid && validatableInput.value > validatableInput.min;
        }
        return isValid;
    }
    App.validate = validate;
})(App || (App = {}));
var App;
(function (App) {
    // Autobin decorater
    function Autobind(_, _2, descriptor) {
        const originDescriptor = descriptor.value;
        const adjDescriptor = {
            configurable: true,
            enumerable: false,
            get() {
                const buttonBind = originDescriptor.bind(this);
                return buttonBind;
            }
        };
        return adjDescriptor;
    }
    App.Autobind = Autobind;
})(App || (App = {}));
/// <reference path="base-component.ts"/>
/// <reference path="../util/validation.ts"/>
/// <reference path="../decoraters/autobind.ts"/>
var App;
(function (App) {
    // Project Input class
    class ProjectInput extends App.Component {
        constructor() {
            super('project-input', 'app', true, 'user-input');
            this.titleInputEl = this.element.querySelector('#title');
            this.descriptionInputEl = this.element.querySelector('#description');
            this.peopleInputEl = this.element.querySelector('#people');
            this.configure();
        }
        gatherUserInput() {
            const enteredTitle = this.titleInputEl.value;
            const enteredDescription = this.descriptionInputEl.value;
            const enteredPeople = this.peopleInputEl.value;
            const titleValidatable = {
                value: enteredTitle,
                required: true
            };
            const descriptionValidatable = {
                value: enteredDescription,
                required: true,
                minLength: 5
            };
            const peopleValidatable = {
                value: +enteredPeople,
                required: true,
                min: 0,
                max: 5
            };
            if (!App.validate(titleValidatable) ||
                !App.validate(descriptionValidatable) ||
                !App.validate(peopleValidatable)) {
                alert('Invalid input, please try again');
                return;
            }
            else {
                return [enteredTitle, enteredDescription, +enteredPeople];
            }
        }
        clearInputs() {
            this.titleInputEl.value = '';
            this.descriptionInputEl.value = '';
            this.peopleInputEl.value = '';
        }
        submitHandler(e) {
            e.preventDefault();
            const userInput = this.gatherUserInput();
            if (Array.isArray(userInput)) {
                const [title, description, people] = userInput;
                App.projectState.addProject(title, description, people);
                console.log(title, description, people);
                this.clearInputs();
            }
        }
        configure() {
            this.element.addEventListener('submit', this.submitHandler);
        }
        renderContent() { }
    }
    __decorate([
        App.Autobind
    ], ProjectInput.prototype, "submitHandler", null);
    App.ProjectInput = ProjectInput;
})(App || (App = {}));
var App;
(function (App) {
    class State {
        constructor() {
            this.listeners = [];
        }
        addListener(listenerFn) {
            this.listeners.push(listenerFn);
        }
    }
    App.State = State;
    class ProjectState extends State {
        constructor() {
            super();
            this.projects = [];
        }
        static getInstance() {
            if (this.instance) {
                return this.instance;
            }
            else {
                this.instance = new ProjectState();
                return this.instance;
            }
        }
        addProject(title, description, numOfPeople) {
            const newProject = new App.Project(Math.random().toString(), title, description, numOfPeople, App.ProjectStatus.Active);
            this.projects.push(newProject);
            this.updateListeners();
        }
        moveProject(prjId, prjNewStatus) {
            const project = this.projects.find(prj => prj.id === prjId);
            if (project && project.status !== prjNewStatus) {
                project.status = prjNewStatus;
                this.updateListeners();
            }
        }
        updateListeners() {
            for (const listenerFn of this.listeners) {
                listenerFn(this.projects.slice());
            }
        }
    }
    App.ProjectState = ProjectState;
    App.projectState = ProjectState.getInstance();
})(App || (App = {}));
/// <reference path="base-component.ts"/>
/// <reference path="../state/state.ts"/>
/// <reference path="../models/drugg-druggable.ts"/>
/// <reference path="../decoraters/autobind.ts"/>
var App;
(function (App) {
    // ProjectList class
    class ProjectList extends App.Component {
        constructor(type) {
            super('project-list', 'app', false, `${type}-projects`);
            this.type = type;
            this.assignedProjects = [];
            this.configure();
            this.renderContent();
        }
        dragOverHandler(event) {
            if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
                event.preventDefault();
                const elForm = this.element.querySelector('ul');
                elForm.classList.add('droppable');
            }
        }
        dropHandler(event) {
            const prjId = event.dataTransfer.getData('text/plain');
            App.projectState.moveProject(prjId, this.type === 'active' ? App.ProjectStatus.Active : App.ProjectStatus.Finshed);
        }
        dragLeaveHandler(_) {
            const elForm = this.element.querySelector('ul');
            elForm.classList.remove('droppable');
        }
        configure() {
            this.element.addEventListener('dragover', this.dragOverHandler);
            this.element.addEventListener('dragleave', this.dragLeaveHandler);
            this.element.addEventListener('drop', this.dropHandler);
            App.projectState.addListener((projects) => {
                const relevantProjects = projects.filter(prj => {
                    if (this.type === 'active') {
                        return prj.status === App.ProjectStatus.Active;
                    }
                    return prj.status === App.ProjectStatus.Finshed;
                });
                this.assignedProjects = relevantProjects;
                this.renderProject();
            });
        }
        renderContent() {
            const listId = `${this.type}-projects-list`;
            this.element.querySelector('ul').id = listId;
            this.element.querySelector('h2').textContent = this.type.toUpperCase() + ' PROJECTS';
        }
        renderProject() {
            const listEl = document.getElementById(`${this.type}-projects-list`);
            listEl.innerHTML = '';
            for (const prjEl of this.assignedProjects) {
                new App.ProjectItem(this.element.querySelector('ul').id, prjEl);
            }
        }
    }
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dragOverHandler", null);
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dropHandler", null);
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dragLeaveHandler", null);
    App.ProjectList = ProjectList;
})(App || (App = {}));
/// <reference path="components/project-input.ts" />
/// <reference path="components/project-list.ts" />
var App;
(function (App) {
    new App.ProjectInput();
    new App.ProjectList('active');
    new App.ProjectList('finished');
})(App || (App = {}));
/// <reference path="base-component.ts"/>
/// <reference path="../decoraters/autobind.ts"/>
var App;
(function (App) {
    // ProjectItem class
    class ProjectItem extends App.Component {
        get persons() {
            if (this.project.people === 1) {
                return '1 person';
            }
            else {
                return `${this.project.people} persons`;
            }
        }
        constructor(hostId, project) {
            super('single-project', hostId, false, project.id);
            this.project = project;
            this.configure();
            this.renderContent();
        }
        dragStartHandler(event) {
            event.dataTransfer.setData('text/plain', this.project.id);
            event.dataTransfer.effectAllowed = 'move';
        }
        dragEndHandler(_) {
            console.log('DragEnd');
        }
        configure() {
            this.element.addEventListener('dragstart', this.dragStartHandler);
            this.element.addEventListener('dragend', this.dragEndHandler);
        }
        renderContent() {
            this.element.querySelector('h2').textContent = this.project.title;
            this.element.querySelector('h3').textContent = this.persons + ' assigned';
            this.element.querySelector('p').textContent = this.project.description;
        }
    }
    __decorate([
        App.Autobind
    ], ProjectItem.prototype, "dragStartHandler", null);
    __decorate([
        App.Autobind
    ], ProjectItem.prototype, "dragEndHandler", null);
    App.ProjectItem = ProjectItem;
})(App || (App = {}));
var App;
(function (App) {
    // Project Type
    let ProjectStatus;
    (function (ProjectStatus) {
        ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
        ProjectStatus[ProjectStatus["Finshed"] = 1] = "Finshed";
    })(ProjectStatus = App.ProjectStatus || (App.ProjectStatus = {}));
    class Project {
        constructor(id, title, description, people, status) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.people = people;
            this.status = status;
        }
    }
    App.Project = Project;
})(App || (App = {}));
//# sourceMappingURL=bundle.js.map