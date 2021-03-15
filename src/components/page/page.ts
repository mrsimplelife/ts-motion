import { BaseComponent, Component } from "../component.js";

export interface Composable {
  addChild(child: Component): void;
}
type OncloseListener = () => void;
class PageItemComponent
  extends BaseComponent<HTMLElement>
  implements Composable {
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

export class PageComponent
  extends BaseComponent<HTMLUListElement>
  implements Composable {
  constructor() {
    super('<ul class="page">This is PageComponent.</ul>');
  }

  addChild(section: Component) {
    const item = new PageItemComponent();
    item.addChild(section);
    item.attachTo(this.element, "beforeend");
    item.setOncloseListner(() => item.removeFrom(this.element));
  }
}
