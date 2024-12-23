(function() {
	const runTrial = ({total, desired}) => {
		let count = total; //effectively we are repeating the original trial
		let wins = 0;
		while (count > 0) {
			count -= 1;
			const r = Math.random() * total;
			if (r <= desired) wins += 1;
		}
		return 100 * wins/total; //express as percentage
	}

	//0123456789ABC
	//X--X--X--X--X
	const span = 25;
	const calcStats = (row) => {
		let trials = 5 + (span * 4); //105 trials
		const sampleResults = [];
		while (trials > 0) {
			trials -= 1;
			sampleResults.push(runTrial(row));
		}
		sampleResults.sort();
		//Return a five-figure summary only
		const si = [0, span+1, 2*span+2, 3*span+3, 4*span+4];
		return si.map(i => sampleResults[i]);
	};

	const makeBoxPlot = stats => {
		const [min, lqt, med, uqt, max] = stats;
		console.log({min, lqt, med, uqt, max});

		return `
		<rect x="${min}" y="4.5" width="${lqt - min}" height="1" fill="green"/>
		<rect x="${lqt}" y="1" width="${med - lqt}" height="8" fill="green"/>
		<rect x="${med}" y="1" width="${uqt - med}" height="8" fill="blue"/>
		<rect x="${uqt}" y="4.5" width="${max - uqt}" height="1" fill="blue"/>
		<rect x="${med}" y="0" width="0.3%" height="10"/>
		<rect x="${min}" y="2" width="0.3%" height="6"/>
		<rect x="${max}" y="2" width="0.3%" height="6"/>
		`;
	}


	const renderRow = (row, i) => {
		const stats = calcStats(row);
		const boxPlot = makeBoxPlot(stats);
		return `
			<div class="row data">
				<span class="col r${i}">${row.name}</span>
				<input type="number" name="n${i}" value="${row.total}" />
				<input type="number" name="w${i}" value="${row.desired}" />
				<div class="col plot"><svg viewBox="0 0 100 10">${boxPlot}</svg></div>
			</div>`;
	}

	STATE.render = () => {
		const html = STATE.rows.map(renderRow);
		STATE.formRows.innerHTML = html.join('\n');
	}

	STATE.recalc.addEventListener('click', () => {
		STATE.rows.forEach((row, v) => {
			let t = +document.querySelector(`input[name="n${v}"]`).value;
			let d = +document.querySelector(`input[name="w${v}"]`).value;
			row.desired = d;
			row.total = t;
		});
		STATE.render();
	});

	//STATE.doInit();
	//STATE.recalc();
	STATE.render();

}());