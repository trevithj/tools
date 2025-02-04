import {makeElement, select, selectAll} from "../selectors.js";
import {createRandomGenerator, generateRandomAscii} from "./generators.js";

const seedInput = select("input[name='seed']");
const getSeed = () => Math.round(parseFloat(seedInput?.value || 0));

const countInput = select("input[name='count']");
const getCount = () => Math.round(parseFloat(countInput?.value || 0));

const createBtn = select("#create");

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
    const add = makeElement("button", "cell append");
    id.innerHTML = object.id;
    set.innerHTML = object.key;
    seq.innerHTML = object.seq;
    add.textContent = "Append";
    add.__data = object;
    parent.append(id, set, seq, add);
}

createBtn.addEventListener("click", () => {
    vals.random = createRandomGenerator(getSeed());
    const data = generate();
    console.log(data);
    const parent = select("#sequences div.rows");
    parent.innerHTML = "";
    data.forEach(d => {
        renderRow(parent, d)
    });
    selectAll("button.append").forEach(btn => {
        btn.addEventListener("click", evt => {
            console.log(evt.target.__data);
        })
    })
});
