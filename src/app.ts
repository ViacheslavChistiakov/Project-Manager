// Project Type
enum ProjectStatus  {Active, Finshed}


class Project {
    constructor(
         public id: string,
         public title: string, 
         public description: string, 
         public people: number, 
         public status: ProjectStatus
        ) {

    }
}


// State Managment
type Listener = (items: Project[]) => void;

class ProjectState {
    private listeners: Listener[] = [];
    private  projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {

    }

   static getInstance() {
        if(this.instance) {
            return this.instance
        } else {
            this.instance = new ProjectState();
            return this.instance
        }
    }

    
    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active)

        this.projects.push(newProject);
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice())
        }
    }


}

const projectState = ProjectState.getInstance();


// validation interface
interface Validatable {
    value: string | number,
    required?: boolean,
    maxLength?: number,
    minLength?: number,
    max?: number,
    min?: number
}

function validate(validatableInput: Validatable) {
    let isValid = true;
    if (validatableInput.required) {
        isValid = isValid && validatableInput.value.toString().trim().length !== 0
    }
    if (validatableInput.maxLength != null &&
        typeof validatableInput.value == 'string'
    ) {
        isValid =
        isValid && validatableInput.value.length < validatableInput.maxLength;
    }
    if (validatableInput.minLength != null &&
        typeof validatableInput.value == 'string'
    ) {
        isValid =
        isValid && validatableInput.value.length > validatableInput.minLength;
    }
    if (validatableInput.max != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value < validatableInput.max
    }
    if (validatableInput.min != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value > validatableInput.min
    }
    return isValid;
}


// Autobin decorater
function Autobind(_: any, _2: string | Symbol, descriptor: PropertyDescriptor) {
    const originDescriptor = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const buttonBind = originDescriptor.bind(this);
            return buttonBind;
        }
    }
    return adjDescriptor;
}
// ProjectList class
class ProjectList {
    templateEl: HTMLTemplateElement;
    hostEl: HTMLDivElement;
    element: HTMLElement;
    assignedProjects!: Project[];


    constructor(private type: 'active' | 'finished') {
        this.templateEl = document.getElementById('project-list')! as HTMLTemplateElement;
        this.hostEl = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateEl.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = `${type}-projects`;
        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj => {
                if(this.type === 'active') {
                   return prj.status === ProjectStatus.Active
                }
                   return prj.status === ProjectStatus.Finshed
            } )
            this.assignedProjects = relevantProjects;
            this.renderProject();
        })
        this.attach();
        this.renderContent();
    }

    private renderProject() {
        const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
        listEl.innerHTML = '';
        for (const prjEl of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = prjEl.title
            listEl?.appendChild(listItem);
        }
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
    }

    private attach() {
        this.hostEl.insertAdjacentElement('beforeend', this.element)
    }
}

// Project Input class
class ProjectInput {
    templateEl: HTMLTemplateElement;
    hostEl: HTMLDivElement;
    element: HTMLFormElement;
    titleInputEl: HTMLInputElement;
    descriptionInputEl: HTMLInputElement;
    peopleInputEl: HTMLInputElement;

    constructor() {
        this.templateEl = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostEl = document.getElementById('app')! as HTMLDivElement;

        const importedNode = document.importNode(this.templateEl.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input';
        this.titleInputEl = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputEl = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputEl = this.element.querySelector('#people') as HTMLInputElement;
        this.configure()
        if (this.element) {
            this.attach();
        } else {
            console.log('The template content does not contain a form element.');
        }

    }

    private gatherUserInput(): [string, string, number] | void {
        const enteredTitle = this.titleInputEl.value;
        const enteredDescription = this.descriptionInputEl.value;
        const enteredPeople = this.peopleInputEl.value;


    const titleValidatable: Validatable = {
        value: enteredTitle,
        required: true
    }
    
     const descriptionValidatable: Validatable = {
        value: enteredDescription,
        required: true,
        minLength: 5
    }  


    const peopleValidatable: Validatable = {
        value: +enteredPeople,
        required: true,
        min: 1,
        max: 5
    }  

        if (
            !validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)
        ) {
            alert('Invalid input, please try again');
            return;
        } else {
            return [enteredTitle, enteredDescription, +enteredPeople]
        }
    }

    private clearInputs() {
        this.titleInputEl.value = '';
        this.descriptionInputEl.value = '';
        this.peopleInputEl.value = '';
    }

    @Autobind
    private submitHandler(e: Event) {
        e.preventDefault();
        const userInput = this.gatherUserInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people)
            console.log(title, description, people);
            this.clearInputs();
        }
    }

    private configure() {
        this.element.addEventListener('submit', this.submitHandler)
    }

    private attach() {
        this.hostEl.insertAdjacentElement('afterbegin', this.element)
    }
}

const prjInput = new ProjectInput();
const prjActive = new ProjectList('active');
const prjDone = new ProjectList('finished');
