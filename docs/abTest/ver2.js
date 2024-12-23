STATE.dist1 = [];
STATE.dist2 = [];
STATE.dist3 = [];
STATE.dist4 = [];

STATE.doInit = () => {
  const getKWins = (p, k) => {
    let wins = 0;
    while (k >= 0) {
      wins += Math.random() < p ? 1 : 0;
      k -= 1;
    }
    return wins;
  }

  const RUNS = 100000;
  const getDist = (n, w) => {
    n = Number.parseInt(n); w = Number.parseInt(w); //coerce into numbers
    if(n===0) return [];
    const p = w / n; //wins divided by total number of trials
    
    let count = RUNS;
    let sums = new Array(n + 2).fill(0);
    while (count > 0) {
      const wins = getKWins(p, n);
      sums[wins] += 1;
      count--;
    };
    // console.log(sums);
    return sums.map(v => v / RUNS);
  }
  // console.log('test dist', getDist(4, 2));

  const getScaledDist = (dist = [], width = 100) => {
    // console.log('dist', dist);
    const scale = dist.length ? width / dist.length : width;
    return dist.map((v, i) => {
      return {
        x: i * scale,
        y: v * 100 / scale
      };
    });
  }

  //Assumes dist has had the x-values scaled to fit width (aka maxX)
  const getPathData = (scaledDist, maxY = 500) => {
    const data = ['M0,0'];
    let yLimit = 0;
    let prev = {
      y: 0
    };
    scaledDist.forEach((pos) => {
      const {
        x,
        y
      } = pos;
      const x2 = Math.round(x);
      const y2 = Math.round(y * -maxY);
      yLimit = yLimit < y2 ? yLimit : y2;
      data.push(` L${x2},${prev.y} L${x2},${y2}`);
      // prev.x = x2;
      prev.y = y2;
    });
    // data.push(` L${prev.x},0 Z`);
    data.push('Z');
    return {
      yLimit,
      data: data.join('')
    };
  }

  const getPathGrid = (maxX, maxY) => {
    const data = [];
    let count = 0;
    const dx = Math.round(maxX / 20);
    while (count <= maxX) {
      data.push(`M${count},0 l0,${maxY}`);
      count += dx;
    }
    return data.join(' ');
  }

  const init = () => {
    const {
      height,
      width
    } = STATE;
    const svg = document.querySelector('svg');
    svg.setAttribute("height", height);
    svg.setAttribute("width", width);
    const xMove = svg.querySelector('g#xMove');
    const grid = svg.querySelector('path.grid');
    grid.setAttribute('d', getPathGrid(width, height));

    STATE.zoomIn.addEventListener('click', () => {
      STATE.xScale *= 1.5;
      STATE.render();
    });
    STATE.zoomOut.addEventListener('click', () => {
      STATE.xScale /= 1.5;
      STATE.render();
    });
    STATE.moveL.addEventListener('click', () => {
      STATE.xOffset -= 100;
      STATE.render();
    });
    STATE.moveR.addEventListener('click', () => {
      STATE.xOffset += 100;
      STATE.render();
    });
    STATE.recalc.addEventListener('click', () => {
      STATE.recalc();
      STATE.render();
    });

    const view = svg.querySelector('g#plots');

    STATE.recalc = () => {
      const p = STATE.params;
      console.time('getDist');
      STATE.dist1 = getDist(+p.n1.value, +p.w1.value);
      STATE.dist2 = getDist(+p.n2.value, +p.w2.value);
      STATE.dist3 = getDist(+p.n3.value, +p.w3.value);
      STATE.dist4 = getDist(+p.n4.value, +p.w4.value);
      console.timeEnd('getDist');
    }

    STATE.render = () => {
      const {
        height,
        width,
        xOffset,
      } = STATE;
      const d1 = getPathData(getScaledDist(STATE.dist1, width), height);
      const d2 = getPathData(getScaledDist(STATE.dist2, width), height);
      const d3 = getPathData(getScaledDist(STATE.dist3, width), height);
      const d4 = getPathData(getScaledDist(STATE.dist4, width), height);
      svg.querySelector('path.a').setAttribute('d', d1.data);
      svg.querySelector('path.b').setAttribute('d', d2.data);
      svg.querySelector('path.c').setAttribute('d', d3.data);
      svg.querySelector('path.d').setAttribute('d', d4.data);
      const yLimit = Math.min(d1.yLimit, d2.yLimit, d3.yLimit, d4.yLimit);
      const yScale = height / -yLimit;
      STATE.yScale = yScale * 0.98;
      view.setAttribute('style', `transform: translate(${xOffset}px,${height}px) scale(${STATE.xScale},${STATE.yScale});`);
      xMove.setAttribute('style', `transform: translateX(${xOffset}px) scaleX(${STATE.xScale});`);
      // console.log(d1.yLimit, d2.yLimit);
    }
  }
  init();
}
STATE.doInit();
STATE.recalc();
STATE.render();