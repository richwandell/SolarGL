type EventHandlers = {
    [key: string]: {
        [key: string]: {handler: Function, which: string|number}
    }
}

type Events = "keydown"|"keyup"|"keypress"|"mousedown"|"mouseup"|"wheel"|"mousemove"|"pad";

class Listener {

    private eventHandlers: EventHandlers = {}
    private element: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    private keyEventFired(event: KeyboardEvent) {
        event.preventDefault();
        const code = event.code;
        const type = event.type;
        const bind = this.eventHandlers[type];
        if (code in bind) {
            if (bind[code].which === code || bind[code].which === event.which || bind[code].which === event.keyCode) {
                bind[code].handler(this, event)
            }
        }
    }

    private mouseEventFired(event: MouseEvent) {
        event.preventDefault();
        const type = event.type;
        const bind = this.eventHandlers[type];
        if (event.button in bind) {
            bind[event.button].handler(this, event)
        }
    }

    public destroy() {
        for(let key of Object.keys(this.eventHandlers)) {
            if (key.startsWith("mouse")) {
                // @ts-ignore
                this.element.removeEventListener(key, this.mouseEventFired)
            } else {
                // @ts-ignore
                document.removeEventListener(key, this.keyEventFired)
            }
        }
    }

    public addEventListener(eventType: Events, which: number|string, handler: Function) {
        if (this.eventHandlers[eventType] === undefined) {
            this.eventHandlers[eventType] = {}
        }
        this.eventHandlers[eventType][which] = {
            handler: handler,
            which
        }

        switch (eventType) {
            case "mousedown":
            case "mouseup":
            case "mousemove":
            case "wheel":
                this.element.addEventListener(eventType, this.mouseEventFired.bind(this))
                break;

            case "keydown":
            case "keyup":
            case "keypress":
                document.addEventListener(eventType, this.keyEventFired.bind(this));
                break;
        }
    }
}

export default Listener;
