import {
  EnableDragging,
  EnableDrop,
  EnableHover,
} from "../../decorators/draggable.js";
import { Draggable, Droppable, Hoverable } from "../common/type.js";
import { BaseComponent, Component } from "../component.js";

export interface Composable {
  addChild(child: Component): void;
}

type OncloseListener = () => void;
type DragState = "start" | "stop" | "enter" | "leave";
type OnDragStateListner<T extends Component> = (
  target: T,
  state: DragState
) => void;

export interface SectionContainer
  extends Component,
    Composable,
    Draggable,
    Hoverable {
  muteChildren(state: "mute" | "unmute"): void;
  setOncloseListner(listener: OncloseListener): void;
  setOnDragStateListener(listener: OnDragStateListner<SectionContainer>): void;
  getBioundingRedct(): DOMRect;
  onDropped(): void;
}

@EnableDragging
@EnableHover
export class PageItemComponent
  extends BaseComponent<HTMLLIElement>
  implements SectionContainer {
  private closeListener?: OncloseListener;
  private dragStateListener?: OnDragStateListner<PageItemComponent>;
  constructor() {
    super(`<li draggable="true" class="page-item">
            <section class="page-item__body"></section>
            <div class="page-item__controls">
              <button class="close">⊠</button>
            </div>
          </li>`);
    const closeBtn = this.element.querySelector(".close")! as HTMLButtonElement;
    closeBtn.onclick = () => {
      this.closeListener && this.closeListener();
    };
  }

  addChild(child: Component) {
    const container = this.element.querySelector(
      ".page-item__body"
    )! as HTMLElement;
    child.attachTo(container, "afterbegin");
  }
  onDragStart(_: DragEvent) {
    this.notifyDragObservers("start");
    this.element.classList.add("lifted");
  }
  onDragEnd(_: DragEvent) {
    this.notifyDragObservers("stop");
    this.element.classList.remove("lifted");
  }
  onDragEnter(_: DragEvent) {
    this.notifyDragObservers("enter");
    this.element.classList.add("drop-area");
  }
  onDragLeave(_: DragEvent) {
    this.notifyDragObservers("leave");
    this.element.classList.remove("drop-area");
  }
  onDropped() {
    this.element.classList.remove("drop-area");
  }
  notifyDragObservers(state: DragState) {
    this.dragStateListener && this.dragStateListener(this, state);
  }

  setOncloseListner(listener: OncloseListener) {
    this.closeListener = listener;
  }
  setOnDragStateListener(listener: OnDragStateListner<PageItemComponent>) {
    this.dragStateListener = listener;
  }
  muteChildren(state: "mute" | "unmute"): void {
    if (state === "mute") return this.element.classList.add("mute-children");
    this.element.classList.remove("mute-children");
  }
  getBioundingRedct(): DOMRect {
    return this.element.getBoundingClientRect();
  }
}

type SectionContainerConstructor = {
  new (): SectionContainer;
};

@EnableDrop
export class PageComponent
  extends BaseComponent<HTMLUListElement>
  implements Composable, Droppable {
  private children = new Set<SectionContainer>();
  private dropTarget?: SectionContainer;
  private dragTarget?: SectionContainer;
  constructor(private pageItemConstructor: SectionContainerConstructor) {
    super('<ul class="page">This is PageComponent.</ul>');
  }
  onDragOver(_: DragEvent) {}
  onDrop(event: DragEvent) {
    if (!this.dropTarget) return;
    if (this.dragTarget && this.dragTarget !== this.dropTarget) {
      const dorpY = event.clientY;
      const srcElement = this.dragTarget.getBioundingRedct();
      this.dragTarget.removeFrom(this.element);
      this.dropTarget.attach(
        this.dragTarget,
        dorpY < srcElement.y ? "beforebegin" : "afterend"
      );
      this.dropTarget.onDropped();
    }
  }

  addChild(section: Component) {
    const item = new this.pageItemConstructor();
    item.addChild(section);
    item.attachTo(this.element, "beforeend");
    this.children.add(item);
    item.setOncloseListner(() => {
      item.removeFrom(this.element);
      this.children.delete(item);
    });
    item.setOnDragStateListener(
      (target: SectionContainer, state: DragState) => {
        switch (state) {
          case "start":
            this.dragTarget = target;
            this.updateSection("mute");
            return;
          case "stop":
            this.dragTarget = undefined;
            this.updateSection("unmute");
            return;
          case "enter":
            this.dropTarget = target;
            return;
          case "leave":
            this.dropTarget = undefined;
            return;
          default:
            throw new Error(`unsupported state:${state}`);
        }
      }
    );
  }
  private updateSection(state: "mute" | "unmute") {
    this.children.forEach((child) => child.muteChildren(state));
  }
}
