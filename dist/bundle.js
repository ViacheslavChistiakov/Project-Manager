"use strict";
var App;
(function (App) {
    // Autobin decorater
    function Autobind(_, _2, descriptor) {
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
    App.Autobind = Autobind;
})(App || (App = {}));
var App;
(function (App) {
    function validate(validatableInput) {
        let isValid = true;
        if (validatableInput.required) {
            isValid = isValid && validatableInput.value.toString().trim().length !== 0;
        }
        if (validatableInput.maxLength != null &&
            typeof validatableInput.value == 'string') {
            isValid =
                isValid && validatableInput.value.length < validatableInput.maxLength;
        }
        if (validatableInput.minLength != null &&
            typeof validatableInput.value == 'string') {
            isValid =
                isValid && validatableInput.value.length > validatableInput.minLength;
        }
        if (validatableInput.max != null && typeof validatableInput.value === 'number') {
            isValid = isValid && validatableInput.value < validatableInput.max;
        }
        if (validatableInput.min != null && typeof validatableInput.value === 'number') {
            isValid = isValid && validatableInput.value > validatableInput.min;
        }
        return isValid;
    }
    App.validate = validate;
})(App || (App = {}));
//# sourceMappingURL=bundle.js.map