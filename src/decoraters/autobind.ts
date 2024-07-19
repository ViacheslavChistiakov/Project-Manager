namespace App {
    // Autobin decorater
export function Autobind(_: any, _2: string | Symbol, descriptor: PropertyDescriptor) {
    const originDescriptor = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const buttonBind = originDescriptor.bind(this);
            return buttonBind;
        }
    }
    return adjDescriptor;
}
}