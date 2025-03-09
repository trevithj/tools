import {makeElement, select, selectAll} from "../selectors.js";
import {createRandomGenerator, generateRandomAscii} from "./generators.js";

const seedInput = select("input[name='seed']");
const getSeed = () => Math.round(parseFloat(seedInput?.value || 0));

const countInput = select("input[name='count']");
const getCount = () => Math.round(parseFloat(countInput?.value || 0));

const vals = {
    get seed() {
        return getSeed();
    },
    get count() {
        return getCount();
    },
    charSets: {
        decimal: "0123456789",
        lowercase: "abcdefghijklmnopqrstuvwxyz",
        uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        special: "!#$%&()*:;?@",
        specialFull: "!\"#$%&()*+,-.\/:;<=>?@",
    },
    random: createRandomGenerator(getSeed())
}

function generate() {
    const { random, charSets, count } = vals;
    return Object.keys(charSets).flatMap((key, index) => {
        const set = charSets[key];
        const gen = generateRandomAscii(random, set);
        return [
            {id: index, key, seq: gen(count)},
            {id: index + 5, key, seq: gen(count)},
        ]
    }).sort((a,b) => a.id - b.id);
}

function renderRow(parent, object) {
    const id = makeElement("div", "cell id");
    const set = makeElement("div", "cell set");
    const seq = makeElement("div", "cell sequence");
    const add = makeElement("button", "ctrl append");
    id.innerHTML = object.id;
    set.innerHTML = object.key;
    seq.innerHTML = object.seq;
    add.textContent = `Append #${object.id}`;
    add.__data = object;
    parent.append(add, set, seq);
}

// Output
const seqOutput = select("#output input[name='sequence']");
const paramsOutput = select("#output input[name='params']");

const createBtn = select("#create");
createBtn.addEventListener("click", () => {
    const seed = getSeed();
    paramsOutput.value = `${seed} ${vals.count}`;
    seqOutput.value = "";
    vals.random = createRandomGenerator(seed);
    const data = generate();
    console.log(data);
    const parent = select("#sequences div.rows");
    parent.innerHTML = "";
    data.forEach(d => {
        renderRow(parent, d)
    });
    selectAll("button.append").forEach(btn => {
        btn.addEventListener("click", evt => {
            const {id, seq} = evt.target.__data;
            seqOutput.value += seq;
            paramsOutput.value += ` ${id}`;
        })
    })
});
