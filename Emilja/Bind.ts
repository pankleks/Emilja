namespace Emilja {
    export interface ILoopState {
    }

    type TGetValueFn = ($component: Component, $loopState: ILoopState) => any;
    type TSetValueFn = ($component: Component, $value: any, $loopState: ILoopState) => any;

    export function getTextFn(expr: string): TGetValueFn {
        return <TGetValueFn>new Function("$component", "$loopState", "with ($component) return `" + expr + "`");
    }

    export function getValueFn(expr: string) {
        return <TGetValueFn>new Function("$component", "$loopState", `with ($component) return ${expr}`);
    }

    export function setValueFn(expr: string) {
        return <TSetValueFn>new Function("$component", "$value", "$loopState", `with ($component) ${expr} = $value`);
    }

    export abstract class Bind {
        abstract async refresh();
    }

    abstract class ReadonlyBind<T extends Node> extends Bind {
        protected readonly _detector = new Detector();

        constructor(protected _node: T, protected _getValueFn: TGetValueFn, protected _loopState: ILoopState) {
            super();
        }

        async refresh() {
            let
                v = await this._getValueFn(this._node.$component, this._loopState);
            if (this._detector.hasChanged(v))
                this.updateElement(v);
        }

        abstract updateElement(v: any);
    }

    export class TextBind extends ReadonlyBind<Node> {
        updateElement(v: any) {
            this._node.textContent = v;
        }
    }

    export class AttrBind extends ReadonlyBind<Element> {
        constructor(node: Element, protected _name: string, getValueFn: TGetValueFn, loopState: ILoopState) {
            super(node, getValueFn, loopState);
        }

        updateElement(v: any) {
            this._node.setAttribute(this._name, v);
        }
    }

    export class BoolAttrBind extends AttrBind {
        updateElement(v: any) {
            if (v)
                this._node.setAttribute(this._name, this._name);
            else
                this._node.removeAttribute(this._name);
        }
    }

    export class IfBind extends ReadonlyBind<Comment> {
        constructor(node: Comment, private _templateEl: Element, getValueFn: TGetValueFn, loopState: ILoopState) {
            super(node, getValueFn, loopState);
        }

        updateElement(v: any) {
            if (v)
                this._node.parentNode.insertBefore(this._templateEl, this._node);
            else
                this._node.parentNode.removeChild(this._templateEl);
        }
    }

    export class LoopBind extends ReadonlyBind<Comment> {

        constructor(node: Comment, private _templateEl: Element, getValueFn: TGetValueFn, loopState: ILoopState) {
            super(node, getValueFn, loopState);
        }

        updateElement(v: any) {
            let
                list = Array.isArray(v) ? v : [];

            for (let i = 0; i < list.length; i++) {
                let
                    el = this._templateEl.cloneNode(true);
                this._node.insertBefore(el, this._node);
            }
        }
    }

    abstract class ValueBind<T extends HTMLElement> extends ReadonlyBind<T> {
        constructor(node: T, getValueFn: TGetValueFn, protected _setValueFn: TSetValueFn, loopState: ILoopState) {
            super(node, getValueFn, loopState);
            this.attach();
        }

        abstract attach();

        updateValue(v: any) {
            execute(() => {
                this._setValueFn(this._node.$component, v, this._loopState);
            }, `bind update value`);
        }
    }

    export class InputBind extends ValueBind<HTMLInputElement> {
        attach() {
            this._node.addEventListener("change", () => {
                this.updateValue(this._node.value);
            })
        }

        updateElement(v: any) {
            this._node.value = v;
        }
    }

    export class CheckboxInputBind extends ValueBind<HTMLInputElement> {
        attach() {
            this._node.addEventListener("change", () => {
                this.updateValue(this._node.checked);
            })
        }

        updateElement(v: any) {
            this._node.checked = v === true;
        }
    }

    export class BindableComponentBind extends ValueBind<BindableComponent<any>> {
        attach() {
            this._node.boundValueChanged = v => this.updateValue(v);
        }

        updateElement(v: any) {
            this._node.setBoundValue(v);
        }
    }
}