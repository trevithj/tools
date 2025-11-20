import {makeElement, select, selectAll} from "../selectors.js";
import {createRandomGenerator, generateRandomAscii} from "./generators.js";
import { stringToIntHash } from "../_common/convert.js";

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
    return Object.keys(charSets).map((key, index) => {
        const set = charSets[key];
        const gen = generateRandomAscii(random, set);
        const seq = gen(count);
        // create and ignore, to keep results compatible with older algorithm
        gen(count);
        return {id: index, key, seq};
        // return [
        //     {id: index, key, seq: gen(count)},
        //     {id: index + 5, key, seq: gen(count)},
        // ]
    }).sort((a,b) => a.id - b.id);
}

function renderRow(parent, object) {
    const id = makeElement("div", "class=cell id center");
    const set = makeElement("div", "class=cell set");
    // const seq = makeElement("div", "class=cell sequence");
    const add = makeElement("button", "class=ctrl append font-mono");
    id.innerHTML = object.id;
    set.innerHTML = object.key;
    // seq.innerHTML = object.seq;
    add.textContent = object.seq;
    add.__data = object;
    parent.append(id, set, add);
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

// extras
const hashInput = select("input[name='hash-string']");
const hashOutput = select("input[name='hash-int']");
hashInput.addEventListener("blur", () => {
    const str = hashInput.value;
    const hash = stringToIntHash(str);
    hashOutput.value = hash;
});
