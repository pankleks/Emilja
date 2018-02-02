interface Node {
    $component: Emilja.Component;
}

interface Element {
    $bindings: Emilja.Bind[];
    $addBind(bind: Emilja.Bind);
    $nativeBind(loopState: Emilja.ILoopState);
    $componentId: number;
}

namespace Emilja {
    const BOOL_ATTR = ["disabled", "readonly", "autofocus", "checked"];

    Element.prototype.$addBind = async function (this: Element, bind: Bind) {
        await bind.refresh();
        this.$bindings.push(bind);
    }

    async function forEachAttr(el: Element, inputFn: (n: string, v: string) => any, eventFn: (n: string, v: string) => any) {
        for (let i = 0; i < el.attributes.length; i++) {
            let
                attr = el.attributes[i];

            if (attr.name.startsWith("[") && attr.name.endsWith("]")) {
                // input
                await inputFn(attr.name.slice(1, -1), attr.value);
                el.removeAttributeNode(attr);
            }
            else
                if (attr.name.startsWith("(") && attr.name.endsWith(")")) {
                    // event
                    await eventFn(attr.name.slice(1, -1), attr.value);
                    el.removeAttributeNode(attr);
                }
        }
    }

    export async function processAttr(el: Element, key: string, fn: (value: string) => any) {
        let
            attr = el.getAttributeNode(key);
        if (attr) {
            await fn(attr.value);
            el.removeAttributeNode(attr);
        }
    }

    function getAttrBind(el: Element, name: string, value: string, loopState: ILoopState) {
        if (BOOL_ATTR.indexOf(name) !== -1)
            return new BoolAttrBind(el, name, getTextFn(value), loopState);

        return new AttrBind(el, name, getTextFn(value), loopState);            
    }

    Element.prototype.$nativeBind = async function (this: Element, loopState: ILoopState) {
        await forEachAttr(
            this,
            (name, value) => this.$addBind(getAttrBind(this, name, value, loopState)),
            (name, value) => {
                let
                    fn = new Function("$component", "$event", "$data", `with ($component) ${value}`);

                this.addEventListener(name, (ev: Event & { detail }) => {
                    ev.stopPropagation();
                    execute(() => fn(this.$component, ev, ev.detail));
                });
            });
    }

    HTMLInputElement.prototype.$nativeBind = async function (this: HTMLInputElement, loopState: ILoopState) {
        await processAttr(this, "ej-bind", v => {
            let
                bind: Bind;
            switch (this.type) {
                case "checkbox":
                    bind = new CheckboxInputBind(this, getValueFn(v), setValueFn(v), loopState);
                    break;
                default:
                    bind = new InputBind(this, getValueFn(v), setValueFn(v), loopState);
                    break;
            }

            return this.$addBind(bind);
        });
    }    

    Component.prototype.$nativeBind = async function (this: Component, loopState: ILoopState) {
        await forEachAttr(
            this,
            (name, value) => this.$addBind(getAttrBind(this, name, value, loopState)),
            (name, value) => {
                let
                    fn = new Function("$component", "$event", "$data", `with ($component) ${value}`);

                this.addEventListener(name + this.$componentId, (ev: Event & { detail }) => {
                    ev.stopPropagation();
                    execute(() => fn(this.$component, ev, ev.detail));
                });
            });
    }

    BindableComponent.prototype.$nativeBind = async function (this: BindableComponent<any>, loopState: ILoopState) {
        await processAttr(this, "ej-bind", value => this.$addBind(new BindableComponentBind(this, getValueFn(value), setValueFn(value), loopState)));

        Component.prototype.$nativeBind.call(this, loopState);
    }
}