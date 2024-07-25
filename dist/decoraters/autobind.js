// Autobin decorater
export default function Autobind(_, _2, descriptor) {
    const originDescriptor = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const buttonBind = originDescriptor.bind(this);
            return buttonBind;
        }
    };
    return adjDescriptor;
}
//# sourceMappingURL=autobind.js.map