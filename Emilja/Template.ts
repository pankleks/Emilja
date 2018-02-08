namespace Emilja {
    export interface IComponentTemplate {
        body?: string;
        url?: string;
        tag?: string;
    }

    export function Template(template: IComponentTemplate) {
        return function (ctor: IComponentCtor) {
            ctor.template = template;

            if (template.tag)
                window.customElements.define(template.tag, ctor);
        }
    }

    export function Input<T extends Component>(name: string, fn?: (self: T) => any) {
        return function (target: Component, key) {
            if (!target._ctor.inputs)
                target._ctor.inputs = {};

            target._ctor.inputs[name] = { key, fn };
        }
    }

    export function Monit<T extends Component>(fn: (self: T) => any) {
        return function (this: any, target, key) {
            if (delete this[key])
                Object.defineProperty(target, key, {
                    set: function (this: any, value) {
                        this["$" + key] = value;
                        execute(() => fn(this), `monit var [${key}]`);
                    },
                    get: function () {
                        return this["$" + key];
                    }
                });
        };
    }
}