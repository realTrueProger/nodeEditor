//rgb to hex function

const rgb2hex = (rgb) => {
    if (/^#[0-9A-F]{6}$/i.test(rgb)) return rgb;
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }

    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
};


// sockets

const actionSocket = new D3NE.Socket('act', 'Action', 'hint');
const dataSocket = new D3NE.Socket('data', 'Data', 'hint');

// eventsHandler

const eventHandlers = {
    list: [],
    remove() {
        this
            .list
            .forEach(h => {
                document.removeEventListener('keydown', h);
            });
        this.list = [];
    },
    add(name, h) {
        document.addEventListener(name, h, false);
        this
            .list
            .push(h);
    }
};

// components

const keydownComp = new D3NE.Component('Keydown event', {
    builder(node) {

        return node
            .addOutput(new D3NE.Output('Action', actionSocket))
            .addOutput(new D3NE.Output('Key code', dataSocket));
    },
    worker(node, inputs, outputs) {

        const task = new D3NE.Task(inputs, function (inps, data) {
            console.log('Keydown event', node.id, data);
            return [data]
        });

        eventHandlers.remove();
        eventHandlers.add('keydown', function (e) {
            task.run(e.keyCode);
            task.reset();
        });

        outputs[0] = task.option(0);
        outputs[1] = task.output(0);
    }
});

const moveControllerComp = new D3NE.Component('Move control', {
    builder(node) {

        return node
            .addInput(new D3NE.Input('Action', actionSocket))
            .addInput(new D3NE.Input('Key code', dataSocket))
            .addOutput(new D3NE.Output('Up', actionSocket))
            .addOutput(new D3NE.Output('Down', actionSocket))
            .addOutput(new D3NE.Output('Left', actionSocket))
            .addOutput(new D3NE.Output('Right', actionSocket));
    },
    worker(node, inputs, outputs) {

        const task = new D3NE.Task(inputs, function (inps) {
            if (inps[0][0] == 38)
                this.closed = [1, 2, 3];
            else if (inps[0][0] == 40)
                this.closed = [0, 2, 3];
            else if (inps[0][0] == 37)
                this.closed = [0, 1, 3];
            else if (inps[0][0] == 39)
                this.closed = [0, 1, 2];
            console.log('Print', node.id, inps);
        });

        outputs[0] = task.option(0);
        outputs[1] = task.option(1);
        outputs[2] = task.option(2);
        outputs[3] = task.option(3);
    }
});

const moveUpComp = new D3NE.Component('Move Up', {
    builder(node) {
        return node
            .addInput(new D3NE.Input('Action', actionSocket));
    },
    worker(node, inputs, outputs) {

        const task = new D3NE.Task(inputs, function () {
            const button = document.getElementById('button');
            const styles = getComputedStyle(button);
            button.style.top = parseInt(styles.top) - 1 + 'px';
        });
    }
});

const moveDownComp = new D3NE.Component('Move Down', {
    builder(node) {
        return node
            .addInput(new D3NE.Input('Action', actionSocket));
    },
    worker(node, inputs, outputs) {

        const task = new D3NE.Task(inputs, function () {
            const button = document.getElementById('button');
            const styles = getComputedStyle(button);
            button.style.top = parseInt(styles.top) + 1 + 'px';
        });
    }
});

const moveLeftComp = new D3NE.Component('Move left', {
    builder(node) {
        return node
            .addInput(new D3NE.Input('Action', actionSocket));
    },
    worker(node, inputs, outputs) {

        const task = new D3NE.Task(inputs, function () {
            const button = document.getElementById('button');
            const styles = getComputedStyle(button);
            button.style.left = parseInt(styles.left) - 1 + 'px';
        });
    }
});

const moveRightComp = new D3NE.Component('Move Right', {
    builder(node) {
        return node
            .addInput(new D3NE.Input('Action', actionSocket));
    },
    worker(node, inputs, outputs) {

        const task = new D3NE.Task(inputs, function () {
            const button = document.getElementById('button');
            const styles = getComputedStyle(button);
            button.style.left = parseInt(styles.left) + 1 + 'px';
        });
    }
});

const colorComp = new D3NE.Component("Button color", {
    builder(node) {
        const numControl = new D3NE.Control('Press enter <input type="text"">',
            (el, c) => {
                const button = document.getElementById('button');
                const styles = getComputedStyle(button);
                el.value = rgb2hex(styles.backgroundColor);

                function upd() {
                    const button = document.getElementById('button');
                    const styles = getComputedStyle(button);
                    button.style.backgroundColor = el.value;
                }

                el.addEventListener("change", () => {
                    upd();
                });
                el.addEventListener("mousedown", function (e) {
                    e.stopPropagation()
                });// prevent node movement when selecting text in the input field
                upd();
            }
        );

        return node.addControl(numControl);
    },
    worker(node, inputs, outputs) {
    }
});

const components = [keydownComp, moveControllerComp, moveUpComp, moveDownComp, moveLeftComp, moveRightComp, colorComp];


// menu, engine and editor

const container = document.querySelector('#d3ne');

const menu = new D3NE.ContextMenu({
    'Change color': colorComp,
    //
    'Keydown': keydownComp,
    //
    'Move Controller': moveControllerComp,
    //
    'Moving controllers': {
        'MoveUp': moveUpComp,
        'MoveDown': moveDownComp,
        'MoveLeft': moveLeftComp,
        'MoveRight': moveRightComp,
    },
}, false);

const editor = new D3NE.NodeEditor('glslsample@0.1.0', container, components, menu);

editor.eventListener.on('connectioncreate connectionremove nodecreate noderemove', (_, p) => {
    if (p)
        compile();
});

const engine = new D3NE.Engine('glslsample@0.1.0', components);

async function compile() {
    await engine.abort();
    const status = await engine.process(editor.toJSON());
}



