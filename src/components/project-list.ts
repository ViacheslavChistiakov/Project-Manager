/// <reference path="base-component.ts"/>
/// <reference path="../state/state.ts"/>
/// <reference path="../models/drugg-druggable.ts"/>
/// <reference path="../decoraters/autobind.ts"/>

namespace App {
    // ProjectList class
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements Dragtarget {
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
}