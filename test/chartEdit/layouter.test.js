// Using Mocka so we can use imports
import assert from "assert"; // built-in Node assertions
import {Helpers} from "../../docs/chartEdit/layouter.js";

// ****************************************
function mockDiv(width, height) {
    return {
        getBoundingClientRect: () => ({width, height})
    }
}


it("should setNodeSizes", () => {
    const nodes = [
        {div: mockDiv(100, 200)},
        {div: mockDiv(200, 100)},
        {div: mockDiv(10, 10)}
    ]
    const [n1, n2, n3] = Helpers.setNodeSizes(nodes, 1, 2);
    // console.log(n1);
    assert(n1.width === 100);
    assert(n2.width === 200);
    assert(n3.width === 10);
    assert(n1.height === 400);
    assert(n2.height === 200);
    assert(n3.height === 20);
})

it("should getCenter as expected", () => {
    // const node = node2NounDiv({name: "Some\nLabel"});
    const node = {x:10, y:25, width: 30, height: 30 };
    const result = Helpers.getCenter(node);
    // console.log(node, result);
    assert(result.cx === 25);
    assert(result.cy === 40);
})

it("should getCenter with zero values", () => {
    // const node = node2NounDiv({name: "Some\nLabel"});
    const node = {x:0, y:0, width: 10, height: 10 };
    const result = Helpers.getCenter(node);
    // console.log(node, result);
    assert(result.cx === 5);
    assert(result.cy === 5);
})

it("should create a verb dataNode", () => {
    // link2VerbDiv, node2NounDiv,
    globalThis.document = {
        createElement: (type) => ({type})
    };
    const nodeMap = new Map([
        ["A", {}],
        ["B", {}]
    ]); 
    const theLink = {src:"A", tgt:"B"};
    const result = Helpers.link2VerbDiv(nodeMap, "link")(theLink);
    const { type, node, div } = result;

    assert.equal(node, theLink);
    assert.equal(type, "verb");
    assert.equal(div.className, "verb");
    assert.equal(div.type, "div");
})
