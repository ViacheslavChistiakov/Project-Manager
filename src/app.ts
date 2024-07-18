// Drag & Draggarable intefaces
interface Druggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void
}

interface Dragtarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}



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



type Listener<T> = (items: T[]) => void;

// State Managment
class State<T> {
    protected listeners: Listener<T>[] = [];
    
    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

class ProjectState extends State<Project> {
    private  projects: Project[] = [];
    private static instance: ProjectState;

    private constructor() {
        super()
    }

   static getInstance() {
        if(this.instance) {
            return this.instance
        } else {
            this.instance = new ProjectState();
            return this.instance
        }
    }

    


    addProject(title: string, description: string, numOfPeople: number) {
        const newProject = new Project(Math.random().toString(), title, description, numOfPeople, ProjectStatus.Active)

        this.projects.push(newProject);
        this.updateListeners();
    }

    moveProject(prjId: string, prjNewStatus: ProjectStatus) {
        const project = this.projects.find(prj => prj.id === prjId);
        if(project && project.status !== prjNewStatus) {
            project.status = prjNewStatus;
            this.updateListeners();
        }
    }

    private updateListeners() {
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
// Component base class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
    templateEl: HTMLTemplateElement;
    hostEl: T;
    element: U;

    constructor(
         temlplateId: string,
         hostElId: string,
         insertAtStart: boolean,
         newElId?: string 
        ) {
        this.templateEl = document.getElementById(temlplateId)! as HTMLTemplateElement;
        this.hostEl = document.getElementById(hostElId)! as T;

        const importedNode = document.importNode(this.templateEl.content, true);
        this.element = importedNode.firstElementChild as U;
        if (newElId) {
            this.element.id = newElId;
        }

        this.attach(insertAtStart);
    }

    private attach(insertAtBeginning: boolean) {
        this.hostEl.insertAdjacentElement(insertAtBeginning ? 'afterbegin': 'beforeend', this.element)
    }

    abstract configure(): void;
    abstract renderContent(): void;
}


// ProjectItem class
class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Druggable{
    private project: Project

    get persons() {
        if (this.project.people === 1) {
            return '1 person'
        } else {
            return `${this.project.people} persons`
        }
    }

    constructor(hostId: string, project: Project) {
        super('single-project', hostId, false, project.id )
        this.project = project; 

        
    this.configure();
    this.renderContent();
    }
    @Autobind
    dragStartHandler(event: DragEvent) {
        event.dataTransfer!.setData('text/plain', this.project.id);
        event.dataTransfer!.effectAllowed = 'move';
    }
    @Autobind
    dragEndHandler(_: DragEvent) {
        console.log('DragEnd');
    }

    configure() {
        this.element.addEventListener('dragstart', this.dragStartHandler)
        this.element.addEventListener('dragend', this.dragEndHandler)
    }

    renderContent() {
        this.element.querySelector('h2')!.textContent = this.project.title;
        this.element.querySelector('h3')!.textContent = this.persons + ' assigned';
        this.element.querySelector('p')!.textContent = this.project.description;
    }

}


// ProjectList class
class ProjectList extends Component<HTMLDivElement, HTMLElement> implements Dragtarget {
    assignedProjects!: Project[];


    constructor(private type: 'active' | 'finished') {
        super('project-list', 'app', false,`${type}-projects` )
        this.assignedProjects = []
   
   
        this.configure();
        this.renderContent();
    }
    @Autobind
    dragOverHandler(event: DragEvent): void {
        if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
            event.preventDefault();
            const elForm = this.element.querySelector('ul')!;
            elForm.classList.add('droppable')
        }
    }
    @Autobind
    dropHandler(event: DragEvent): void {
        const prjId = event.dataTransfer!.getData('text/plain');
        projectState.moveProject(prjId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finshed)
    }
    @Autobind
    dragLeaveHandler(_: DragEvent): void {
        const elForm = this.element.querySelector('ul')!;
        elForm.classList.remove('droppable')
    }

    configure(){
        this.element.addEventListener('dragover', this.dragOverHandler);
        this.element.addEventListener('dragleave', this.dragLeaveHandler);
        this.element.addEventListener('drop', this.dropHandler);
        projectState.addListener((projects: Project[]) => {
            const relevantProjects = projects.filter(prj => {
                if(this.type === 'active') {
                   return prj.status === ProjectStatus.Active
                }
                   return prj.status === ProjectStatus.Finshed
            } )
            this.assignedProjects = relevantProjects;
            this.renderProject();
        });
    }

     renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
    }

    private renderProject() {
        const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
        listEl.innerHTML = '';
        for (const prjEl of this.assignedProjects) {
            new ProjectItem(this.element.querySelector('ul')!.id, prjEl);
        }
    }


}

// Project Input class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputEl: HTMLInputElement;
    descriptionInputEl: HTMLInputElement;
    peopleInputEl: HTMLInputElement;

    constructor() {
        super('project-input', 'app', true, 'user-input');

        this.titleInputEl = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputEl = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputEl = this.element.querySelector('#people') as HTMLInputElement;


        this.configure();

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
        min: 0,
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

   configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    renderContent() {}

}

const prjInput = new ProjectInput();
const prjActive = new ProjectList('active');
const prjDone = new ProjectList('finished');