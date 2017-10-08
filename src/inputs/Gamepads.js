import _ from 'lodash';

class Gamepads {
	constructor(url) {
		this.callbacks = {};
		this.connected = false;
		this.websocket = null;

		this.showDebugger =  true;
		this.debugEl = null;

		this.buttonKeys = ["A", "B", "X", "Y", "LB", "RB", "LT", "RT"];
		this.axesKeys = ["Left X", "Left Y", "Right X", "Right Y", "DPad X", "DPad Y"];
		
		this.initializeWebSocket(url);
		this.update();
	}

	initializeWebSocket(url) {
		console.log("Gamepad Server connecting to: ", url);

		this.websocket = new WebSocket(url);
		this.websocket.onopen = this.onOpen.bind(this);
		this.websocket.onclose = this.onClose.bind(this);
		this.websocket.onmessage = this.onMessage.bind(this);
		this.websocket.onerror = this.onError.bind(this);
	}


	onOpen(evt) {
		console.log('Gamepad Server connected:', evt);
		this.connected = true;
	}

	onClose(evt) {
		console.log('Gamepad Server disconnected:', evt);
		this.connected = false;
	}
	
	onMessage(msg) {
		this.callbacks["message"](JSON.parse(msg.data));
	}

	onError(evt) {
		console.log('Gamepad Server error:', evt);
	}

	on(name, cb) {
		this.callbacks[name] = cb;
	}

	send(msg) {
		if (this.connected) {
			try {
				this.websocket.send(JSON.stringify(msg), this.onError);
			}
			catch(err) {
				this.onError(err);
			}
			finally {}

		}
	}

	buttonPressed(b) {
		if (typeof(b) == "object") {
			return b.pressed;
		}
		return b == 1.0;
	}

	update() {
		var g = _.each(navigator.getGamepads(), (g)=> { if (g!==null) {
			var inputs = _.concat(_.compact(_.map(g.buttons, (b, idx) => { if (this.buttonPressed(b.pressed)) {
				return {
					id: this.buttonKeys[idx],
					pressed: b.pressed,
					value: b.value
				}
			}})),
			_.compact(_.map(g.axes, (a, idx) => { if (a!==0) {
				return {
					id: this.axesKeys[idx],
					value: a
				}
			}})));

			if (inputs.length>0) {
				this.send(inputs);
			}

			if (this.showDebugger) {
				if (!this.debugEl) {
					this.debugEl = document.createElement("div");
					this.debugEl.id = "controllerDebug";
					document.getElementById("lowerDisplay").appendChild(this.debugEl);
				}

				this.updateDebugger(this.debugEl, inputs, g.index+1);
			}
		}});
		
		requestAnimationFrame(this.update.bind(this));
	}

	updateDebugger(container, inputs, id) {
		container.innerHTML = "";
		var title = document.createElement("h5");
		title.innerHTML = "Controller #" + id;
		container.appendChild(title);

		var list = document.createElement("ul");
		_.each(inputs, (input, idx) => {
			var i = document.createElement("li");
			var text = input.id + ": " + input.value;
			if (input.pressed) {
				text += " ("+ input.pressed + ")";
			}
			i.innerHTML = text;
			list.appendChild(i);
		});
		
		container.appendChild(list);
	}
}

module.exports = Gamepads;