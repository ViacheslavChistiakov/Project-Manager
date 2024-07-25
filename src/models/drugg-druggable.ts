
// Drag & Draggarable intefaces
export interface Druggable {
    dragStartHandler(event: DragEvent): void;
    dragEndHandler(event: DragEvent): void
}

export interface Dragtarget {
    dragOverHandler(event: DragEvent): void;
    dropHandler(event: DragEvent): void;
    dragLeaveHandler(event: DragEvent): void;
}

