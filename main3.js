// sockets

const actionSocket = new D3NE.Socket('act', 'Action', 'hint');
const dataSocket = new D3NE.Socket('data', 'Data', 'hint');
const numSocket = new D3NE.Socket("number", "Number value", "hint");

// eventsHandler



// components

const componentNum = new D3NE.Component("Number", {
    builder(node) {
       const out1 = new D3NE.Output("Number", numSocket);
       const numControl = new D3NE.Control('<input type="number">',
          (el, c) => {
             el.value = c.getData('num') || 1;
          
             function upd() {
                c.putData("num", parseFloat(el.value));
             }
 
             el.addEventListener("input", ()=>{
                upd();
                editor.eventListener.trigger("change");
             });
             el.addEventListener("mousedown", function(e){e.stopPropagation()});// prevent node movement when selecting text in the input field
            upd();
          }
       );
 
       return node.addControl(numControl).addOutput(out1);
    },
    worker(node, inputs, outputs) {
        for(let i = 0; i < outputs.length; i++) {
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





const components = [componentNum, componentAdd];


// menu, engine and editor

const container = document.querySelector('#d3ne');

const menu = new D3NE.ContextMenu({
    'componentNum': componentNum,
    'componentAdd': componentAdd 
}, false);

const editor = new D3NE.NodeEditor('glslsample@0.1.0', container, components, menu);


const engine = new D3NE.Engine('glslsample@0.1.0', components);

editor.eventListener.on("change", async function() {
    await engine.abort();
    await engine.process(editor.toJSON());
 });

 editor.eventListener.trigger("change");




