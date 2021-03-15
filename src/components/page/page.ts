import { BaseComponent, Component } from "../component.js";

export interface Composable {
  addChild(child: Component): void;
}

type OncloseListener = () => void;

export interface SectionContainer extends Component, Composable {
  setOncloseListner(listener: OncloseListener): void;
}

export class PageItemComponent
  extends BaseComponent<HTMLElement>
  implements SectionContainer {
  private closeListener?: OncloseListener;
  constructor() {
    super(`<li class="page-item">
            <section class="page-item__body"></section>
            <div class="page-item__controls">
              <button class="close">⨂</button>
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
  setOncloseListner(listener: OncloseListener) {
    this.closeListener = listener;
  }
}

type SectionContainerConstructor = {
  new (): SectionContainer;
};

export class PageComponent
  extends BaseComponent<HTMLUListElement>
  implements Composable {
  constructor(private pageItemConstructor: SectionContainerConstructor) {
    super('<ul class="page">This is PageComponent.</ul>');
  }

  addChild(section: Component) {
    const item = new this.pageItemConstructor();
    item.addChild(section);
    item.attachTo(this.element, "beforeend");
    item.setOncloseListner(() => item.removeFrom(this.element));
  }
}
