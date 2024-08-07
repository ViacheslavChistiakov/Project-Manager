import { Project, ProjectStatus } from "../models/status";

    // State Managment
type Listener<T> = (items: T[]) => void;


export class State<T> {
    protected listeners: Listener<T>[] = [];
    
    addListener(listenerFn: Listener<T>) {
        this.listeners.push(listenerFn);
    }
}

export class ProjectState extends State<Project> {
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

export const projectState = ProjectState.getInstance();
export { Project };

