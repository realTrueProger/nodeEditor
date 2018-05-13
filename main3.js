// sockets

const actionSocket = new D3NE.Socket('act', 'Action', 'hint');
const dataSocket = new D3NE.Socket('data', 'Data', 'hint');
const numSocket = new D3NE.Socket("number", "Number value", "hint");

// Select node

let template = document.querySelector('#selectNode').innerHTML;

function test(event) {
    const nodeId = event.srcElement.dataset.test;
    const node = editor.nodes.find(n => n.id == nodeId);
    node.outputs.splice(node.outputs.length - 1, 0, new D3NE.Output("Hit", actionSocket));
    node.outputs[node.outputs.length - 2].node = node;
    editor.view.update();
    editor.view.update();

}

// components

const componentNum = new D3NE.Component("Number", {
    template: template,
    builder(node) {
        const out1 = new D3NE.Output("Number", numSocket);
        const out2 = new D3NE.Output("Number", numSocket);
        const numControl = new D3NE.Control('<input type="number">',
            (el, c) => {
                el.value = c.getData('num') || 1;

                function upd() {
                    c.putData("num", parseFloat(el.value));
                }

                el.addEventListener("input", () => {
                    upd();
                    editor.eventListener.trigger("change");
                });
                el.addEventListener("mousedown", function (e) { e.stopPropagation() });// prevent node movement when selecting text in the input field
                upd();
            }
        );
        const numControl2 = new D3NE.Control('<input type="number">',
            (el, c) => {
                el.value = c.getData('num') || 1;

                function upd() {
                    c.putData("num", parseFloat(el.value));
                }

                el.addEventListener("input", () => {
                    upd();
                    editor.eventListener.trigger("change");
                });
                el.addEventListener("mousedown", function (e) { e.stopPropagation() });// prevent node movement when selecting text in the input field
                upd();
            }
        );

        return node.addControl(numControl).addOutput(out1).addOutput(out2).addControl(numControl2);
    },
    worker(node, inputs, outputs) {
        for (let i = 0; i < outputs.length; i++) {
            outputs[i] = node.data.num;
        }
    }
});

const componentAdd = new D3NE.Component("Add", {
    builder(node) {
        const inp1 = new D3NE.Input("Number", numSocket);
        const inp2 = new D3NE.Input("Number", numSocket);
        const out = new D3NE.Output("Number", numSocket);

        const numControl = new D3NE.Control(
            '<input readonly type="number">',
            (el, control) => {
                control.setValue = val => {
                    el.value = val;
                };
            }
        );

        return node
            .addInput(inp1)
            .addInput(inp2)
            .addControl(numControl)
            .addOutput(out);
    },
    worker(node, inputs, outputs) {
        const sum = inputs[0][0] + inputs[1][0];
        editor.nodes.find(n => n.id == node.id).controls[0].setValue(sum);
        outputs[0] = sum;
    }
});


// b4web Node logic

const entryPoint = new D3NE.Component("Entry Point", {
    builder(node) {
        const out1 = new D3NE.Output("Next", actionSocket);
        const template = '<div><input type="checkbox" id="check1"><label for="check1">Run from Script</label></div>';
        const runScriptControl = new D3NE.Control(template,
            (el, c) => {

            }
        );

        return node.addControl(runScriptControl).addOutput(out1);
    },
    worker(node, inputs, outputs) {
        for (let i = 0; i < outputs.length; i++) {
            outputs[i] = node.data.num;
        }
    }
});

const select = new D3NE.Component("Select", {
    builder(node) {
        const inp1 = new D3NE.Input("Previous", actionSocket);
        const out1 = new D3NE.Output("Hit", actionSocket);
        const out2 = new D3NE.Output("Miss", actionSocket);
        const template = '<div>Add socket  <button id="btn1">+</button></div>';
        const runScriptControl = new D3NE.Control(template,
            (el, c) => {
                el.addEventListener('click', () => {
                    //node.addOutput(new D3NE.Output("Hit", actionSocket));
                    node.outputs.splice(node.outputs.length - 1, 0, new D3NE.Output("Hit", actionSocket));
                    node.outputs[node.outputs.length - 2].node = node;
                    editor.view.update();
                    editor.view.update();
                })

            }
        );

        return node
            .addControl(runScriptControl)
            .addInput(inp1)
            .addOutput(out1)
            .addOutput(out2);
    },
    worker(node, inputs, outputs) {

    }
});





const select2 = new D3NE.Component("Select2", {
    template: template,
    builder(node) {
        const inp1 = new D3NE.Input("Previous", actionSocket);
        const out1 = new D3NE.Output("Hit", actionSocket);
        const out2 = new D3NE.Output("Miss", actionSocket);
        const runScriptControl = new D3NE.Control('<div>Add socket  <button id="btn1">+</button></div>',
            (el, c) => {
                el.addEventListener('click', () => {
                    //node.addOutput(new D3NE.Output("Hit", actionSocket));
                    node.outputs.splice(node.outputs.length - 1, 0, new D3NE.Output("Hit", actionSocket));
                    node.outputs[node.outputs.length - 2].node = node;
                    editor.view.update();
                    editor.view.update();
                })

            }
        );

        return node
            .addInput(inp1)
            .addControl(runScriptControl)
            .addOutput(out1)
            .addOutput(out2);
    },
    worker(node, inputs, outputs) {

    }
});





const components = [componentNum, componentAdd, entryPoint, select, select2];


// menu, engine and editor

const container = document.querySelector('#d3ne');

const menu = new D3NE.ContextMenu({
    'componentNum': componentNum,
    'componentAdd': componentAdd,
    'b4w': {
        'Entry Point': entryPoint,
        'Select': select,
        'Select2': select2
    }
}, false);

const editor = new D3NE.NodeEditor('glslsample@0.1.0', container, components, menu);


const engine = new D3NE.Engine('glslsample@0.1.0', components);

editor.eventListener.on("change", async function () {
    await engine.abort();
    await engine.process(editor.toJSON());
});

editor.eventListener.trigger("change");




