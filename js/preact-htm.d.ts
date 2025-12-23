/**
 * Type definitions for Preact htm
 */
declare module 'https://esm.sh/htm/preact' {
    export function html(strings: TemplateStringsArray, ...values: any[]): any;
    export function render(node: any, parent: Element | Document | ShadowRoot | DocumentFragment): void;
}
