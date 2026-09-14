//#region classes/struct/Iterable.js
var e = class {
	addOne(e) {
		throw Error(".addOne(...) is not implemented");
	}
	result() {
		throw Error(".result() is not implemented");
	}
	add(e) {
		e.foreach === void 0 ? Array.isArray(e) ? e.forEach((e) => this.addOne(e)) : this.addOne(e) : e.foreach((e) => this.addOne(e));
	}
}, t = class extends e {
	constructor() {
		super(), this._buffer = [];
	}
	addOne(e) {
		this._buffer.push(e);
	}
	result() {
		let e = this._buffer;
		return this._buffer = [], e;
	}
}, n = class extends e {
	constructor(e = new t(), n = (e) => e) {
		super(), this._wrapped = e, this._wrap = n;
	}
	addOne(e) {
		this._wrapped.addOne(e);
	}
	result() {
		return this._wrap(this._wrapped.result());
	}
}, r = class {
	iterator() {
		throw Error(".iterator() is not implemented");
	}
	[Symbol.iterator]() {
		return this.iterator().symbol;
	}
	get nonEmpty() {
		return this.iterator().hasNext;
	}
	get isEmpty() {
		return !this.nonEmpty;
	}
	get head() {
		return this.iterator().next();
	}
	get tail() {
		return this.drop(1);
	}
	get size() {
		let e = 0;
		return this.iterator().foreach(() => e += 1), e;
	}
	get toArray() {
		let e = [];
		return this.foreach((t) => e.push(t)), e;
	}
	get flatten() {
		return this.flattenWith();
	}
	newBuilder() {
		return new t();
	}
	equals(e) {
		if (typeof e.iterator == "function") {
			let t = this.iterator(), n = e.iterator();
			for (; t.hasNext && n.hasNext;) {
				let e = t.next(), r = n.next();
				if (typeof e.equals == "function") {
					if (!e.equals(r)) return !1;
				} else if (e != r) return !1;
			}
			return t.hasNext === n.hasNext;
		}
		return !1;
	}
	equalsBy(e, t) {
		if (typeof e.iterator == "function") {
			let n = this.iterator(), r = e.iterator();
			for (; n.hasNext && r.hasNext;) {
				let e = t(n.next()), i = t(r.next());
				if (typeof e.equals == "function") {
					if (!e.equals(i)) return !1;
				} else if (e != i) return !1;
			}
			return n.hasNext === r.hasNext;
		}
		return !1;
	}
	foreach(e) {
		this.iterator().foreach(e);
	}
	exists(e) {
		let t = this.iterator(), n = !1;
		for (; !n && t.hasNext;) n = e(t.next());
		return n;
	}
	forall(e) {
		return !this.exists((t) => !e(t));
	}
	contains(e) {
		return this.exists((t) => t == e);
	}
	count(e = (e) => !0) {
		let t = 0;
		return this.foreach((n) => {
			e(n) && (t += 1);
		}), t;
	}
	mkString(e = "") {
		return this.iterator().mkString(e);
	}
	to(e = this.newBuilder()) {
		return this.iterator().to(e);
	}
	take(e, t = this.newBuilder()) {
		let n = this.iterator(), r = 0;
		for (; r < e && n.hasNext;) t.addOne(n.next()), r += 1;
		return t.result();
	}
	drop(e, t = this.newBuilder()) {
		return e <= 0 ? this : (this.iterator().drop(e).foreach((e) => t.addOne(e)), t.result());
	}
	filter(e, t = this.newBuilder()) {
		return this.foreach((n) => {
			e(n) && t.addOne(n);
		}), t.result();
	}
	filterNot(e, t = this.newBuilder()) {
		return this.filter((t) => !e(t), t);
	}
	minusOne(e, t = this.newBuilder()) {
		return typeof e.equals == "function" ? this.filterNot((t) => e.equals(t)) : this.filterNot((t) => t == e);
	}
	minus(e, t = this.newBuilder()) {
		return typeof e.contains == "function" ? this.filterNot((t) => e.contains(t)) : this.minusOne(e, t);
	}
	map(e, t = this.newBuilder()) {
		return this.foreach((n) => t.addOne(e(n))), t.result();
	}
	flatMap(e, t = this.newBuilder()) {
		return this.foreach((n) => {
			let r = e(n);
			typeof r.iterator == "function" ? r.iterator().foreach((e) => t.addOne(e)) : Array.isArray(r) ? r.forEach((e) => t.addOne(e)) : t.addOne(r);
		}), t.result();
	}
	flattenWith(e = this.newBuilder()) {
		return this.flatMap((e) => e, e);
	}
	async asyncMap(e, t = this.newBuilder()) {
		let n = this.iterator();
		for (; n.hasNext;) {
			let r = await Promise.resolve(e(n.next()));
			t.addOne(r);
		}
		return t.result();
	}
	async mapParallel(e, n = this.newBuilder()) {
		let r = new t();
		this.foreach((t) => r.addOne(Promise.resolve(e(t))));
		let i = await Promise.all(r.result());
		return n.add(i), n.result();
	}
	zipMap(e, t = (e, t) => [e, t], n = this.newBuilder()) {
		let r = this.iterator(), i = e.iterator();
		for (; r.hasNext && i.hasNext;) n.addOne(t(r.next(), i.next()));
		return n.result();
	}
	mergeWith(e, t = (e, t) => [e, t], n = (e) => e, r = (e) => e, i = this.newBuilder()) {
		let a = this.iterator(), o = e.iterator();
		for (; a.hasNext && o.hasNext;) i.addOne(t(a.next(), o.next()));
		for (; a.hasNext;) i.addOne(n(a.next()));
		for (; o.hasNext;) i.addOne(r(o.next()));
		return i.result();
	}
	_find(e) {
		let t = this.iterator(), n = null;
		for (; n == null && t.hasNext;) {
			let r = t.next();
			e(r) && (n = r);
		}
		return n;
	}
}, i = class extends r {
	get hasNext() {
		throw Error(".hasNext not implemented");
	}
	next() {
		throw Error(".next() not implemented");
	}
	iterator() {
		return this;
	}
	get symbol() {
		let e = this;
		return { next: function() {
			return e.hasNext ? { value: e.next() } : { done: !0 };
		} };
	}
	get nonEmpty() {
		return this.hasNext;
	}
	get head() {
		return this.next();
	}
	foreach(e) {
		for (; this.hasNext;) e(this.next());
	}
	drop(e) {
		for (var t = 0; t < e && this.hasNext;) this.next(), t += 1;
		return this;
	}
	to(e) {
		return this.foreach((t) => e.addOne(t)), e.result();
	}
	mkString(e = "") {
		if (this.hasNext) {
			let t = this.next().toString();
			for (; this.hasNext;) t += e, t += this.next().toString();
			return t;
		}
		return "";
	}
}, a = class extends i {
	get hasNext() {
		return !1;
	}
	next() {
		throw Error("Called next() on an empty iterator");
	}
	take() {
		return this;
	}
	drop() {
		return this;
	}
	map() {
		return this;
	}
	flatMap() {
		return this;
	}
	filter() {
		return this;
	}
	filterNot() {
		return this;
	}
}, o = class e extends i {
	constructor(e) {
		super(), this._item = e, this._consumed = !1;
	}
	get hasNext() {
		return !this._consumed;
	}
	next() {
		return this._consumed = !0, this._item;
	}
	take(e) {
		return e > 0 ? this : new a();
	}
	drop(e) {
		return e <= 0 || (this._consumed = !0), this;
	}
	map(t) {
		return this.hasNext ? new e(t(this._item)) : this;
	}
	flatMap(t) {
		if (this.hasNext) {
			let n = t(this._item);
			return typeof n.iterator == "function" ? n.iterator() : new e(n);
		}
		return this;
	}
	filter(e) {
		return this.hasNext && !e(this._item) ? new a() : this;
	}
}, s = class extends i {
	constructor(e) {
		super(), this._source = e;
	}
	get hasNext() {
		return this._source.hasNext;
	}
	next() {
		return this._source.next();
	}
	newBuilder() {
		return this._source.newBuilder();
	}
	map(e) {
		return this._source.map(e);
	}
	flatMap(e) {
		return this._source.flatMap(e);
	}
	filter(e) {
		return this._source.filter(e);
	}
}, c = class e extends s {
	constructor(e, t = (e) => e) {
		super(e), this._map = t, this._cachedIter = null;
	}
	_pollIter() {
		for (; (this._cachedIter === null || !this._cachedIter.hasNext) && this._source.hasNext;) {
			let e = this._map(this._source.next());
			this._cachedIter = typeof e.iterator == "function" ? e.iterator() : new o(e);
		}
		return this._cachedIter;
	}
	get hasNext() {
		let e = this._pollIter();
		return e != null && e.hasNext;
	}
	next() {
		return this._pollIter().next();
	}
	map(t) {
		return new e(this, (e) => new o(t(e)));
	}
	flatMap(t) {
		return new e(this, t);
	}
	filter(t) {
		return new e(this, (e) => t(e) ? new o(e) : new a());
	}
}, l = class e extends s {
	constructor(e, t) {
		super(e), this._map = t;
	}
	next() {
		return this._map(this._source.next());
	}
	map(t) {
		return new e(this, t);
	}
	flatMap(e) {
		return new c(this, e);
	}
	filter(e) {
		return this.flatMap((t) => e(t) ? new o(t) : new a());
	}
}, u = class e extends s {
	constructor(e, t) {
		super(e), this._condition = t, this._cached = null;
	}
	get poll() {
		for (; this._cached == null && this._source.hasNext;) {
			let e = this._source.next();
			this._condition(e) && (this._cached = e);
		}
		return this._cached;
	}
	get hasNext() {
		return this.poll != null;
	}
	next() {
		let e = this.poll;
		return this._cached = null, e;
	}
	map(e) {
		return new l(this, e);
	}
	flatMap(e) {
		return new c(this, e);
	}
	filter(t) {
		return new e(this, t);
	}
}, ee = class e extends i {
	constructor(e) {
		super(), this._getNext = e;
	}
	get hasNext() {
		return !0;
	}
	next() {
		return this._getNext();
	}
	map(t) {
		return new e(() => t(this.next()));
	}
	flatMap(e) {
		return new c(this, e);
	}
	filter(e) {
		return new u(this, e);
	}
	drop() {
		return this;
	}
}, te = class extends i {
	constructor(e, t) {
		super(), this._start = e, this._transform = t, this._last = e, this._started = !1;
	}
	get hasNext() {
		return !0;
	}
	next() {
		if (this._started) {
			let e = this._transform(this._last);
			return this._last = e, e;
		}
		return this._started = !0, this._start;
	}
	map(e) {
		return new l(this, e);
	}
	flatMap(e) {
		return new c(this, e);
	}
	filter(e) {
		return new u(this, e);
	}
}, ne = class extends s {
	constructor(e, t = 0) {
		super(e), this._remaining = t;
	}
	get hasNext() {
		return this._remaining > 0 && this._source.hasNext;
	}
	next() {
		return --this._remaining, this._source.next();
	}
	take(e) {
		return this._remaining > e && (this._remaining = e), this;
	}
	map(e) {
		return new l(this, e);
	}
	flatMap(e) {
		return new c(this, e);
	}
	filter(e) {
		return new u(this, e);
	}
}, d = class extends i {
	static empty = new a();
	static once(e) {
		return new o(e);
	}
	static continually(e) {
		return new ee(e);
	}
	static iterate(e, t) {
		return new te(e, t);
	}
	take(e) {
		return e <= 0 ? new a() : new ne(this, e);
	}
	map(e) {
		return new l(this, e);
	}
	flatMap(e) {
		return new c(this, e);
	}
	filter(e) {
		return new u(this, e);
	}
	filterNot(e) {
		return this.filter((t) => !e(t));
	}
}, f = class e extends r {
	constructor(e) {
		super(), this._value = e === void 0 ? null : e, this._empty = e == null || e === "";
	}
	static none = new e(null);
	static some(t) {
		return new e(t);
	}
	static from(t) {
		return t instanceof e ? t : new e(t);
	}
	static flat(e) {
		return this.from(e);
	}
	static resolve(e) {
		return typeof e == "function" ? this.from(e()) : this.none;
	}
	iterator() {
		return this.match((e) => d.once(e), () => d.empty);
	}
	newBuilder() {
		return new n(new t(), (t) => {
			switch (t.length) {
				case 0: return e.none;
				case 1: return e.some(t[0]);
				default: return t;
			}
		});
	}
	get value() {
		return this._value;
	}
	get get() {
		if (this.isEmpty) throw Error("None.get");
		return this.value;
	}
	get isEmpty() {
		return this._empty;
	}
	get nonEmpty() {
		return !this.isEmpty;
	}
	get isDefined() {
		return this.nonEmpty;
	}
	get size() {
		return +!this.isEmpty;
	}
	get head() {
		return this.value;
	}
	get headOption() {
		return this;
	}
	foreach(e) {
		this.nonEmpty && e(this.value);
	}
	forall(e) {
		return this.isEmpty ? !0 : e(this.value);
	}
	exists(e) {
		return !this.isEmpty && e(this.value);
	}
	filter(t) {
		return this.isEmpty || t(this.value) ? this : e.none;
	}
	valueOf() {
		return this._value;
	}
	equals(e) {
		return this.isEmpty && e.isEmpty || this.valueOf() === e.valueOf();
	}
	toString() {
		return this.isEmpty ? "None" : `Some(${this._value.toString()})`;
	}
	orElse(t) {
		return this.isEmpty ? typeof t == "function" ? e.from(t()) : e.from(t) : this;
	}
	getOrElse(e) {
		return this.isEmpty ? typeof e == "function" ? e() : e : this.value;
	}
	find(e) {
		return this.filter(e);
	}
	match(e, t) {
		return this.isEmpty ? typeof t == "function" ? t() : t : e(this.value);
	}
	map(t) {
		return this.match((n) => new e(t(n)), () => e.none);
	}
}, p = f.none;
function m(e) {
	return f.some(e);
}
//#endregion
//#region classes/struct/IterableWithOption.js
var h = class extends r {
	get headOption() {
		return this.isEmpty ? p : m(this.head);
	}
	find(e) {
		let t = this.iterator();
		for (; t.hasNext;) {
			let n = t.next();
			if (e(n)) return m(n);
		}
		return p;
	}
	findMap(e) {
		let t = this.iterator();
		for (; t.hasNext;) {
			let n = e(t.next());
			if (n.nonEmpty) return n;
		}
		return p;
	}
}, g = class extends d {
	nextOption() {
		return this.hasNext ? m(this.next()) : p;
	}
	find(e) {
		for (; this.hasNext;) {
			let t = this.next();
			if (e(t)) return m(t);
		}
		return p;
	}
}, re = class extends g {
	constructor(e) {
		super(), this._source = e;
	}
	get hasNext() {
		return this._source.hasNext;
	}
	next() {
		return this._source.next();
	}
}, ie = class extends g {
	constructor(e = [], t = 0) {
		super(), this._source = e, this._next = t;
	}
	get hasNext() {
		return this._next < this._source.length;
	}
	next() {
		let e = this._source[this._next];
		return this._next += 1, e;
	}
	drop(e) {
		return e <= 0 || (this._next += e), this;
	}
}, _ = class e extends g {
	constructor(e, n, r = 1, i = () => new t()) {
		super(), this._next = e, this.last = n, this.step = r, this._acceptCondition = r >= 0 ? function(e) {
			return e <= n;
		} : function(e) {
			return e >= n;
		}, this.makeBuilder = i;
	}
	get hasNext() {
		return this._acceptCondition(this._next);
	}
	next() {
		let e = this._next;
		return this._next += this.step, e;
	}
	newBuilder() {
		return this.makeBuilder();
	}
	toString() {
		return this.isEmpty ? "empty" : `${this.start} to ${this.last}`;
	}
	get size() {
		return this.hasNext ? Math.floor((this.last - this._next) / this.step) + 1 : 0;
	}
	take(t) {
		let n = this._next + (t - 1) * this.step;
		return this.step > 0 ? this.last < n ? this : new e(this._next, n, this.step, this.makeBuilder) : this.last > n ? this : new e(this._next, n, this.step, this.makeBuilder);
	}
	drop(e) {
		return e > 0 && (this._next += this.step * e), this;
	}
}, v = class e extends h {
	constructor(e, n, r = !1, i = 1, a = () => new t()) {
		super(), this.start = e, this._end = n, this.isInclusive = r, this.isForward = n >= e, this.step = this.isForward === i >= 0 ? i : -i, this.makeBuilder = a;
	}
	static empty = new e(0, 0);
	static from(n, r = () => new t()) {
		return new e(n, n, !0, 1, r);
	}
	static between(n, r, i = () => new t()) {
		return n > r ? new e(r, n, !0, 1, i) : new e(n, r, !0, 1, i);
	}
	get first() {
		return this.start;
	}
	get end() {
		return this.isInclusive ? this._end + this.step : this._end;
	}
	get min() {
		return this.isForward ? this.first : this.last;
	}
	get max() {
		return this.isForward ? this.last : this.first;
	}
	get isBackward() {
		return !this.isForward;
	}
	get length() {
		return this.isEmpty ? 0 : this.isForward ? this.last - this.start + 1 : this.start - this.last + 1;
	}
	reverseIterator() {
		return new _(this.last, this.first, -this.step, this.makeBuilder);
	}
	get reverse() {
		return this.isEmpty ? this : new e(this.last, this.start, !0, -this.step, this.makeBuilder);
	}
	get forward() {
		return this.isForward ? this : this.reverse;
	}
	get backward() {
		return this.isBackward ? this : this.reverse;
	}
	get last() {
		return this.isInclusive ? this._end : this._end - this.step;
	}
	iterator() {
		return new _(this.start, this.last, this.step, this.makeBuilder);
	}
	get nonEmpty() {
		return this.isInclusive || this.start !== this._end;
	}
	get isEmpty() {
		return !this.nonEmpty;
	}
	get size() {
		return Math.floor(Math.abs((this.end - this.start) / this.step));
	}
	get head() {
		return this.start;
	}
	newBuilder() {
		return this.makeBuilder();
	}
	contains(e) {
		return this.isForward ? e >= this.start && e <= this.last : e <= this.start && e >= this.last;
	}
	take(t) {
		return t <= 0 ? new e(this.start, this.start, !1, this.step, this.makeBuilder) : t >= this.size ? this : new e(this.start, this.start + (t - 1) * this.step, !0, this.step, this.makeBuilder);
	}
	drop(t) {
		return t <= 0 ? this : t >= this.size ? new e(this._end, this._end, !1, this.step, this.makeBuilder) : new e(this.start + t * this.step, this._end, this.isInclusive, this.step, this.makeBuilder);
	}
	withStart(t) {
		return new e(t, this._end, this.isInclusive, this.step, this.makeBuilder);
	}
	withEnd(t) {
		return new e(this.start, t, !1, this.step, this.makeBuilder);
	}
	withLast(t) {
		return new e(this.start, t, !0, this.step, this.makeBuilder);
	}
	to(e) {
		return this.withLast(e);
	}
	until(e) {
		return this.withEnd(e);
	}
	withStep(t) {
		return new e(this.start, this._end, this.isInclusive, t, this.makeBuilder);
	}
	by(e) {
		return this.withStep(e);
	}
}, y = class extends h {
	get(e) {
		throw Error(".get(Int) not implemented");
	}
	get indices() {
		let e = this;
		return new v(0, this.size, !1, 1, () => e.newBuilder());
	}
	get last() {
		return this.get(this.size - 1);
	}
	get lastOption() {
		return this.nonEmpty ? m(this.last) : p;
	}
	reverseIterator() {
		return this.indices.reverseIterator().map((e) => this.get(e));
	}
	get nonEmpty() {
		return this.size > 0;
	}
	get head() {
		return this.get(0);
	}
	foreach(e) {
		this.forRange(e);
	}
	toString() {
		return `[${this.mkString(", ")}]`;
	}
	lift(e) {
		return e < 0 || e >= this.size ? p : m(this.get(e));
	}
	option(e) {
		return this.lift(e);
	}
	mkString(e = "") {
		if (this.isEmpty) return "";
		{
			let t = "";
			for (let n = 0; n < this.size - 1; n++) t += this.get(n).toString(), t += e;
			return t + this.last;
		}
	}
	indexWhere(e) {
		for (let t = 0; t < this.size; t++) if (e(this.get(t))) return m(t);
		return p;
	}
	indexOf(e) {
		return typeof e.equals == "function" ? this.indexWhere((t) => e.equals(t)) : this.indexWhere((t) => t == e);
	}
	forRange(e, t = 0, n = this.size) {
		if (t instanceof v) t.foreach((t) => e(this.get(t)));
		else for (let r = t; r < n; r++) e(this.get(r));
	}
};
//#endregion
//#region classes/struct/Vector.js
function b(e, t) {
	return e == null ? t == null ? 0 : -1 : t == null ? 1 : typeof e == "number" && typeof t == "number" ? e - t : typeof e == "string" && typeof t == "string" ? e.localeCompare(t) : typeof e.compareTo == "function" ? e.compareTo(t) : e.toString().localeCompare(t.toString());
}
var x = class extends g {
	constructor(e, n = 0, r = 0, i = () => new t()) {
		super(), this._source = e, this._length = n, this._nextIndex = r, this._makeNewBuilder = i;
	}
	get hasNext() {
		return this._nextIndex < this._length;
	}
	next() {
		let e = this._source(this._nextIndex);
		return this._nextIndex += 1, e;
	}
	newBuilder() {
		this._makeNewBuilder();
	}
	drop(e) {
		return this._nextIndex += e, this;
	}
}, S = class e extends y {
	constructor(e = []) {
		super(), this._array = Array.isArray(e) ? e : [e], this._size = this._array.length;
	}
	static empty = new e();
	static single(t) {
		return new e([t]);
	}
	static from(r) {
		return r == null ? e.empty : r instanceof e ? r : typeof r.iterator == "function" ? r.iterator().to(new n(new t(), (t) => new e(t))) : new e(r);
	}
	static flat(e) {
		return this.from(e);
	}
	get sorted() {
		return this.sortWith(b);
	}
	get distinct() {
		return this.distinctWith((e, t) => e === t);
	}
	iterator() {
		let e = this;
		return new x((t) => e._array[t], this.size, 0, () => e.newBuilder());
	}
	iteratorWith(e) {
		let t = this;
		function n(e) {
			return t.get(e);
		}
		return e === void 0 ? new x(n, this.size, 0, () => t.newBuilder()) : new x(n, this.size, 0, e);
	}
	newBuilder() {
		return new n(new t(), (t) => new e(t));
	}
	get(e) {
		return this._array[e];
	}
	get size() {
		return this._size;
	}
	get head() {
		return this._array[0];
	}
	get last() {
		return this._array[this.size - 1];
	}
	get toArray() {
		return this._array.slice();
	}
	take(n) {
		if (n >= this.size) return this;
		if (n <= 0) return e.empty;
		{
			let r = new t();
			return this.forRange((e) => r.addOne(e), 0, n), new e(r.result());
		}
	}
	sortWith(t = b) {
		return new e(this.toArray.sort(t));
	}
	sortBy(e, t = b) {
		return this.sortWith((n, r) => t(e(n), e(r)));
	}
	plusOne(t) {
		let n = this._array.slice();
		return n.push(t), new e(n);
	}
	plus(t) {
		if (t instanceof e) return new e(this._array.concat(t._array));
		if (t instanceof r) {
			let n = this._array.slice();
			return t.foreach((e) => n.push(e)), new e(n);
		}
		return Array.isArray(t) ? new e(this._array.concat(t)) : this.plusOne(t);
	}
	prependOne(t) {
		let n = this._array.slice();
		return n.unshift(t), new e(n);
	}
	padTo(t, n) {
		if (this.size >= t) return this;
		{
			let r = this.toArray;
			if (typeof n == "function") for (let e = this.size; e <= t; e++) r.push(n());
			else for (let e = this.size; e <= t; e++) r.push(n);
			return new e(r);
		}
	}
	distinctWith(t) {
		let n = [];
		return this.foreach((e) => {
			n.some((n) => t(e, n)) || n.push(e);
		}), new e(n);
	}
	distinctBy(t) {
		let n = [], r = [];
		return this.foreach((e) => {
			let i = t(e);
			r.some((e) => e == i) || (n.push(e), r.push(i));
		}), new e(n);
	}
}, C = class extends e {
	constructor() {
		super(), this._array = [];
	}
	addOne(e) {
		this._array.push(e);
	}
	result() {
		let e = new S(this._array);
		return this._array = [], e;
	}
}, ae = class extends g {
	constructor(e, t, n = () => new C()) {
		super(), this._first = e, this._second = t, this._nextIndex = 0, this._makeBuilder = n;
	}
	get hasNext() {
		return this._nextIndex < 2;
	}
	next() {
		let e = this._nextIndex;
		if (this._nextIndex += 1, e === 0) return this._first;
		if (e === 1) return this._second;
		throw Error("No more items to return in next() in PairIterator");
	}
	newBuilder() {
		return this._makeBuilder();
	}
}, w = class e extends y {
	constructor(e, t) {
		super(), this._first = e, this._second = t;
	}
	get first() {
		return this._first;
	}
	get second() {
		return this._second;
	}
	get reverse() {
		return new e(this.second, this.first);
	}
	iterator() {
		let e = this;
		return new ae(this.first, this.second, () => e.newBuilder());
	}
	get(e) {
		if (e == 0) return this.first;
		if (e == 1) return this.second;
		throw Error(e + " is an invalid index in a Pair");
	}
	toString() {
		return `(${this.first}, ${this.second})`;
	}
	get size() {
		return 2;
	}
	newBuilder() {
		return new n(new C(), (t) => t.size === 2 ? new e(t.head, t.get(1)) : t);
	}
	take(e) {
		return e <= 0 ? S.empty : e >= 2 ? this : S.single(this.first);
	}
	foreach(e) {
		e(this.first), e(this.second);
	}
	map(t) {
		return new e(t(this.first), t(this.second));
	}
	withFirst(t) {
		return new e(t, this.second);
	}
	withSecond(t) {
		return new e(this.first, t);
	}
	mapFirst(e) {
		return this.withFirst(e(this.first));
	}
	mapSecond(e) {
		return this.withSecond(e(this.second));
	}
}, oe = class e {
	constructor(e, t = !0) {
		this._value = e, this._isRight = t;
	}
	static left(t) {
		return new e(t, !1);
	}
	static right(t) {
		return new e(t, !0);
	}
	get value() {
		return this._value;
	}
	get isRight() {
		return this._isRight;
	}
	get isLeft() {
		return !this._isRight;
	}
	get right() {
		return this._isRight ? m(this._value) : p;
	}
	get left() {
		return this._isRight ? p : m(this._value);
	}
	get toPair() {
		return new w(this.left, this.right);
	}
	match(e, t) {
		return this._isRight ? t(this._value) : e(this._value);
	}
};
function T(e) {
	return oe.right(e);
}
function E(e) {
	return oe.left(e);
}
//#endregion
//#region classes/struct/ArrayWrapper.js
function D(e) {
	if (Array.isArray(e)) return T(e);
	if (e == null) return T([]);
	{
		let t = e.toArray;
		return t === void 0 ? typeof e.iterator == "function" ? T(e.iterator().toArray) : E(e) : T(t);
	}
}
var se = class e extends y {
	constructor(e = []) {
		super(), this.array = e;
	}
	static from(t) {
		return D(t).match((t) => new e([t]), (t) => new e(t));
	}
	static flat(e) {
		return this.from(e);
	}
	static newBuilder() {
		return new n(new t(), (t) => new e(t));
	}
	get length() {
		return this.array.length;
	}
	get toVector() {
		return new S(this.toArray);
	}
	iterator() {
		return new ie(this.array);
	}
	newBuilder() {
		return new C();
	}
	get size() {
		return this.array.length;
	}
	get toArray() {
		return this.array.slice();
	}
	get(e) {
		return this.array[e];
	}
	addOne(e) {
		this.array.push(e);
	}
	add(e) {
		typeof e.iterator == "function" ? e.iterator().foreach((e) => this.array.push(e)) : Array.isArray(e) ? e.forEach((e) => this.array.push(e)) : this.array.push(e);
	}
	pushOne(e) {
		this.addOne(e);
	}
	push(e) {
		this.add(e);
	}
	prependOne(e) {
		this.array.unshift(e);
	}
	prepend(e) {
		D(e).match((e) => this.prependOne(e), (e) => {
			e.length > 0 && this.array.unshift(...e);
		});
	}
	insertOne(e, t = 0) {
		this.array.splice(t, 0, e);
	}
	insert(e, t = 0) {
		D(e).match((n) => this.insertOne(e, t), (e) => this.array.splice(t, 0, ...e));
	}
	pop() {
		if (this.nonEmpty) return this.array.pop();
		throw Error("Called .pop() on an empty ArrayWrapper");
	}
	tryPop() {
		return this.nonEmpty ? m(this.array.pop()) : p;
	}
	popLast() {
		return this.pop();
	}
	tryPopLast() {
		return this.tryPop();
	}
	popFirst() {
		if (this.nonEmpty) return this.array.shift();
		throw Error("Called .popFirst() on an empty ArrayWrapper");
	}
	tryPopFirst() {
		return this.nonEmpty ? m(this.array.shift()) : p;
	}
	popIndex(e) {
		return this.array.splice(e, 1)[0];
	}
	tryPopIndex(e) {
		return e >= 0 && e < this.size ? m(this.popIndex(e)) : p;
	}
	clear() {
		this.array.splice(0, this.array.length);
	}
	popAll() {
		let e = this.toVector;
		return this.clear(), e;
	}
	removeFirstWhere(e) {
		this.indexWhere(e).foreach((e) => this.array.splice(e, 1));
	}
	removeWhere(e) {
		this.indexWhere(e).foreach((t) => {
			let n = new C(), r = v.from(t);
			v.from(t + 1).until(this.size).foreach((t) => {
				e(this.get(t)) && (r.contains(t - 1) ? r = r.to(t) : (n.addOne(r), r = v.from(t)));
			}), n.addOne(r), n.result().reverseIterator().foreach((e) => this.array.splice(e.start, e.length));
		});
	}
	remove(e) {
		typeof e.equals == "function" ? this.removeFirstWhere((t) => e.equals(t)) : this.removeFirstWhere((t) => t == e);
	}
	modifyRange(e, t) {
		e.foreach((e) => {
			let n = this.array[e], r = t(n);
			n != r && (this.array[e] = r);
		});
	}
	modify(e) {
		this.modifyRange(this.indices, e);
	}
};
//#endregion
//#region classes/struct/Dict.js
function O(e) {
	return e instanceof w ? e : e instanceof S && e.nonEmpty ? e.size === 2 ? new w(e.head, e.get(1)) : new w(e.head, e.tail) : Array.isArray(e) && e.length > 0 ? e.length === 2 ? new w(e[0], e[1]) : new w(e[0], new S(e.slice(1))) : new w(e, S.empty);
}
function k(e) {
	if (e instanceof S && e.forall((e) => e instanceof w)) return e;
	if (e instanceof w) return e.forall((e) => e instanceof w) ? e : new S([e]);
	if (e instanceof Map) {
		let t = [];
		return e.forEach((e, n) => t.push(new w(e, n))), new S(t);
	}
	return e instanceof r ? e.mapWith((e) => O(e), new C()) : Array.isArray(e) ? e.length !== 2 || e.every((e) => e instanceof w || e instanceof S || Array.isArray(e)) ? new S(e).map((e) => O(e)) : new S([new w(e[0], e[1])]) : typeof e == "object" ? new S(Object.keys(e)).map((t) => new w(t, e[t])) : new S([new w(e, S.empty)]);
}
function A(e) {
	return e == null ? "null" : e.toJson === void 0 ? typeof e == "number" || typeof e == "boolean" ? e.toString() : typeof e == "string" ? `"${e}"` : e instanceof S ? `[${e.map((e) => A(e)).mkString(", ")}]` : Array.isArray(e) ? `[${new S(e).map((e) => A(e)).mkString(", ")}]` : e instanceof f ? e.match((e) => A(e), () => "null") : f.resolve(e.iterator).match((e) => `[${e.map((e) => A(e)).mkString(", ")}]`, () => typeof e == "object" ? `{${new S(Object.keys(e)).map((t) => `"${t}": ${A(e[t])}`).mkString(", ")}}` : `"${e.toString()}"`) : e.toJson;
}
function j(e) {
	return e.length > 1 ? (t) => e(t.first, t.second) : e;
}
var M = class e extends h {
	constructor(e = S.empty) {
		super(), this._pairs = k(e), this._keys = this._pairs.map((e) => e.first);
	}
	static empty = new e(S.empty);
	_dictOrVector(t) {
		return t.forall((e) => e instanceof w) ? new e(t) : t;
	}
	iterator() {
		let e = this;
		return this._pairs.iteratorWith(() => e.newBuilder());
	}
	newBuilder() {
		return new n(new C(), (e) => this._dictOrVector(e));
	}
	newDictBuilder() {
		return new n(new C(), (t) => new e(t));
	}
	toString() {
		return this.toJson;
	}
	find(e) {
		return new f(this._find(j(e)));
	}
	foreach(e) {
		return super.foreach(j(e));
	}
	forall(e) {
		return super.forall(j(e));
	}
	exists(e) {
		return super.exists(j(e));
	}
	filter(e, t = this.newDictBuilder()) {
		return super.filter(j(e), t);
	}
	map(e, t = this.newBuilder()) {
		return super.map(j(e), t);
	}
	flatMap(e, t = this.newBuilder()) {
		return super.flatMap(j(e), t);
	}
	async asyncMap(e, t = this.newBuilder()) {
		return await super.asyncMap(j(e), t);
	}
	async mapParallel(e, t = this.newBuilder()) {
		return await super.mapParallel(j(e), t);
	}
	get nonEmpty() {
		return this._pairs.nonEmpty;
	}
	get head() {
		return this._pairs.head;
	}
	get headOption() {
		return this._pairs.headOption;
	}
	get size() {
		return this._pairs.size;
	}
	get toJson() {
		return `{${this._pairs.iterator().map((e) => `"${e.first}": ${A(e.second)}`).mkString(", ")}}`;
	}
	get keys() {
		return this._keys;
	}
	get toVector() {
		return this._pairs;
	}
	get values() {
		return this._pairs.map((e) => e.second);
	}
	valuesIterator() {
		return this._pairs.iterator().map((e) => e.second);
	}
	filterNot(e, t = this.newBuilder()) {
		let n = j(e);
		return this.filter((e) => !n(e), t);
	}
	mapKeys(e) {
		return this.map((t) => t.mapFirst(e));
	}
	mapValues(e) {
		return this.map((t) => t.mapSecond(e));
	}
	containsKey(e) {
		return this.keys.contains(e);
	}
	get(e) {
		return this._pairs.find((t) => t.first === e).map((e) => e.second);
	}
	apply(e) {
		return this.get(e).match((e) => e, () => {
			throw Error("No value for key: " + e);
		});
	}
	getVector(e) {
		return this.get(e).match((e) => e instanceof S ? e : e instanceof r ? e.to(new C()) : Array.isArray(e) ? new S(e) : new S([e]), () => S.empty);
	}
	plus(t, n) {
		if (n === void 0) {
			let n = k(t), r = n.map((e) => e.first), i = this._pairs.filterNot((e) => r.contains(e.first));
			return new e(i.plus(n));
		}
		return new e(this._pairs.filterNot((e) => e.first === t).plusOne(new w(t, n)));
	}
	minus(e) {
		let t = this.filterNot((t) => t.first === e);
		return t.size === this.size && e instanceof r ? t.filterNot((t) => e.exists((e) => t.first === e)) : t;
	}
	append(e, t) {
		return t === void 0 ? this.append(O(e)) : this.plus(e, this.getVector(e).plus(t));
	}
}, ce = class extends e {
	constructor() {
		super(), this._buffer = /* @__PURE__ */ new Map();
	}
	add(e) {
		k(e).foreach((e) => this._buffer.set(e.first, e.second));
	}
	addOne(e) {
		let t = O(e);
		this._buffer.set(t.first, t.second);
	}
	result() {
		let e = new M(this._buffer);
		return this._buffer = [], e;
	}
}, le = class extends e {
	constructor() {
		super(), this._buffer = /* @__PURE__ */ new Map();
	}
	addOne(e) {
		let t = O(e), n = t.first, r = t.second;
		if (this._buffer.has(n)) this._buffer.get(n).add(r);
		else {
			let e = new C();
			e.add(r), this._buffer.set(n, e);
		}
	}
	result() {
		let e = new M(this._buffer).mapValues((e) => e.result());
		return this._buffer = /* @__PURE__ */ new Map(), e;
	}
}, N = class e {
	constructor(e = null, t = p) {
		this._value = e, this._failure = t;
	}
	static success(t) {
		return new e(t);
	}
	static failure(t = /* @__PURE__ */ Error("Try failed")) {
		return t instanceof Error ? new e(null, m(t)) : typeof t == "string" ? new e(null, m(Error(t))) : new e(null, m(/* @__PURE__ */ Error("Try failed")));
	}
	static apply(t) {
		if (typeof t == "function") try {
			return e.success(t());
		} catch (t) {
			return e.failure(t);
		}
		return e.success(t);
	}
	valueOf() {
		return this._value;
	}
	equals(e) {
		return this.valueOf() === e.valueOf();
	}
	get success() {
		return this.isFailure ? p : m(this._value);
	}
	get failure() {
		return this._failure;
	}
	get isFailure() {
		return this.failure.nonEmpty;
	}
	get isSuccess() {
		return !this.isFailure;
	}
	get get() {
		return this.failure.foreach((e) => {
			throw e;
		}), this._value;
	}
	match(e, t) {
		return this.failure.match(t, () => e(this._value));
	}
};
function P(e) {
	return N.failure(e);
}
function F(e) {
	return N.success(e);
}
//#endregion
//#region classes/struct/CollectionFunctions.js
function ue(e, t) {
	let n = e.newBuilder(), r = e.newBuilder();
	return e.foreach((e) => t(e).match((e) => n.addOne(e), (e) => r.addOne(e))), new w(n.result(), r.result());
}
function de(e, t) {
	return ue(e, (e) => t(e) ? T(e) : E(e));
}
function fe(e) {
	return e.zipMap(e.iterator.drop(1), (e, t) => new w(e, t));
}
//#endregion
//#region classes/struct/Pointer.js
var I = class {
	constructor(e, t) {
		this._old = e, this._new = t;
	}
	get oldValue() {
		return this._old;
	}
	get newValue() {
		return this._new;
	}
}, pe = class e {
	constructor(e = p) {
		this._value = e, this._listeners = S.empty, this._namedListeners = M.empty;
	}
	static flat(t) {
		return t instanceof e ? t : new e(t);
	}
	get value() {
		return this._value;
	}
	set value(e) {
		let t = this._value;
		if (this._value = e, e !== t && (this._listeners.nonEmpty || this._namedListeners.nonEmpty)) {
			let n = new I(t, e);
			this._listeners.foreach((e) => e(n)), this._namedListeners.valuesIterator().foreach((e) => e(n));
		}
	}
	onChange(e) {
		this._listeners = this._listeners.plus(e);
	}
	addNamedListener(e, t) {
		this._namedListeners = this._namedListeners.plus(e, t);
	}
	addAndCallListener(e, t = p, n = null) {
		n == null ? this.onChange(e) : this.addNamedListener(n, e), this._value !== t && e(new I(t, this._value));
	}
	removeNamedListener(e) {
		this._namedListeners = this._namedListeners.minus(e);
	}
}, L = class e {
	constructor(e) {
		this.result = p, this.wrapped = e;
		let t = this;
		e.then((e) => {
			e instanceof N ? t.result = m(e) : t.result = m(F(e));
		}).catch((e) => t.result = m(P(e)));
	}
	static reject(t) {
		return new e(Promise.reject(t));
	}
	static resolve(t) {
		return new e(Promise.resolve(t));
	}
	get success() {
		return this.result.flatMap((e) => e.success);
	}
	get failure() {
		return this.result.flatMap((e) => e.failure);
	}
	get isCompleted() {
		return this.result.isDefined;
	}
	get isPending() {
		return !this.isCompleted;
	}
	get isSuccess() {
		return this.success.isDefined;
	}
	get isFailure() {
		return this.failure.isDefined;
	}
	then(e = function(e) {
		return e;
	}, t = function(e) {
		throw e;
	}) {
		return this.wrapped.then((n) => n instanceof N ? n.match((t) => e(t), (e) => t(e)) : e(n), t);
	}
	catch(e) {
		return this.then((e) => e, (t) => e(t));
	}
	finally(e) {
		return this.wrapped.then((t) => t instanceof N ? e(t) : e(F(t)), (t) => e(P(t)));
	}
	thenWithState(t = function(e) {
		return e;
	}, n = function(e) {
		throw e;
	}) {
		return new e(this.then(t, n));
	}
	map(t) {
		return new e(this.finally(t));
	}
	mapSuccess(e) {
		return this.thenWithState(e);
	}
	mapFailure(t) {
		return new e(this.catch(t));
	}
};
function R(e) {
	return e instanceof L ? e : e instanceof Promise ? new L(e) : e instanceof N ? e.match((e) => L.resolve(e), (e) => L.reject(e)) : typeof e == "function" ? R(e()) : L.resolve(e);
}
//#endregion
//#region classes/struct/Lazy.js
var me = class e {
	constructor(e) {
		this._generator = typeof e == "function" ? e : () => e, this._value = p;
	}
	static from(t) {
		return t instanceof e ? t : new e(t);
	}
	static flat(e) {
		return this.from(e);
	}
	static async(t) {
		return t instanceof L ? new e(() => t) : t instanceof e ? t.map((e) => R(e)) : new e(() => R(t));
	}
	get value() {
		return this._value.getOrElse(() => {
			let e = this._generator();
			return this._value = m(e), e;
		});
	}
	get newValue() {
		return this.isEmpty || this.reset(), this.value;
	}
	get current() {
		return this._value;
	}
	get isEmpty() {
		return this._value.isEmpty;
	}
	get nonEmpty() {
		return this._value.nonEmpty;
	}
	reset() {
		this._value = p;
	}
	pop() {
		let e = this.value;
		return this.reset(), e;
	}
	popCurrent() {
		return this.current.map((e) => (this.reset(), e));
	}
	map(t) {
		return new e(() => t(this.value));
	}
}, z = 1e3, B = z * 60, V = B * 60, H = V * 24, U = H * 7;
function W(e) {
	return e % 1 == 0 ? e.toFixed(0) : e.toFixed(1);
}
var G = class e {
	constructor(e) {
		this._millis = e instanceof Date ? e.getTime() : e;
	}
	static zero = new e(0);
	static flat(t) {
		return t instanceof e ? t : typeof t == "string" ? new e(new Date(t)) : new e(t);
	}
	valueOf() {
		return this._millis;
	}
	equals(e) {
		return this.valueOf() === e.valueOf();
	}
	toString() {
		if (this.isNegative) {
			let e = this.toDays;
			if (e < -1) return `${W(e)} days`;
			{
				let e = this.toHours;
				if (e < -1) return `${W(e)} hours`;
				{
					let e = this.toMinutes;
					if (e < -1) return `${W(e)} minutes`;
					{
						let e = this.toSeconds;
						return e < -1 ? `${W(e)} seconds` : `${this.toMillis} milliseconds`;
					}
				}
			}
		}
		{
			let e = this.toFullWeeks;
			if (e > 1) {
				let t = `${e} weeks`, n = this.daysPart;
				return n >= .1 ? `${t} ${W(n)} days` : t;
			}
			{
				let e = this.toFullDays;
				if (e > 1) {
					let t = `${e} days`, n = this.hoursPart;
					return n >= .1 ? `${t} ${W(n)} hours` : t;
				}
				{
					let e = this.toFullHours;
					if (e > 1) {
						let t = `${e} hours`, n = this.minutesPart;
						return n >= .1 ? `${t} ${W(n)} minutes` : t;
					}
					{
						let e = this.toFullMinutes;
						if (e > 1) {
							let t = `${e} minutes`, n = this.secondsPart;
							return n >= .1 ? `${t} ${n} seconds` : t;
						}
						{
							let e = this.toSeconds;
							return e > 1 ? `${W(e)} seconds` : `${this.toMillis} milliseconds`;
						}
					}
				}
			}
		}
	}
	get toJson() {
		return this._millis;
	}
	get isPositive() {
		return this._millis > 0;
	}
	get isNegative() {
		return this._millis < 0;
	}
	get isZero() {
		return this._millis === 0;
	}
	get toMillis() {
		return this._millis;
	}
	get millisPart() {
		return this._millis % z;
	}
	get isMillis() {
		return this._millis > 1;
	}
	get toSeconds() {
		return this._millis / z;
	}
	get toFullSeconds() {
		return Math.floor(this.toSeconds);
	}
	get secondsPart() {
		return this.toSeconds % 60;
	}
	get fullSecondsPart() {
		return this.toFullSeconds % 60;
	}
	get isSeconds() {
		return this._millis >= 2 * z;
	}
	get toMinutes() {
		return this._millis / B;
	}
	get toFullMinutes() {
		return Math.floor(this.toMinutes);
	}
	get minutesPart() {
		return this.toMinutes % 60;
	}
	get fullMinutesPart() {
		return this.toFullMinutes % 60;
	}
	get isMinutes() {
		return this._millis >= 2 * B;
	}
	get toHours() {
		return this._millis / V;
	}
	get toFullHours() {
		return Math.floor(this.toHours);
	}
	get hoursPart() {
		return this.toHours % 24;
	}
	get fullHoursPart() {
		return this.toFullHours % 24;
	}
	get isHours() {
		return this._millis >= 2 * V;
	}
	get toDays() {
		return this._millis / H;
	}
	get toFullDays() {
		return Math.floor(this.toDays);
	}
	get daysPart() {
		return this.toDays % 7;
	}
	get fullDaysPart() {
		return this.toFullDays % 7;
	}
	get isDays() {
		return this._millis >= 2 * H;
	}
	get toWeeks() {
		return this._millis / U;
	}
	get toFullWeeks() {
		return Math.floor(this.toWeeks);
	}
	get isWeeks() {
		return this._millis >= 2 * U;
	}
	plus(t) {
		return t instanceof e ? new e(this._millis + t.toMillis) : t instanceof Date ? new e(this._millis + t.getTime()) : new e(this._millis + t);
	}
	minus(t) {
		return t instanceof e ? new e(this._millis - t.toMillis) : t instanceof Date ? new e(this._millis - t.getTime()) : new e(this._millis - t);
	}
	times(t) {
		return new e(this._millis * t);
	}
	dividedBy(t) {
		return new e(this._millis / t);
	}
};
function K(e) {
	return new G(e);
}
function he(e) {
	return new G(e * z);
}
function ge(e) {
	return new G(e * B);
}
function q(e) {
	return new G(e * V);
}
function _e(e) {
	return new G(e * H);
}
function ve(e) {
	return new G(e * U);
}
//#endregion
//#region classes/time/DateLocalizationContext.js
var ye = class {
	constructor(e, t, n = (e) => e, r = (e, t) => `${e} ${t}`) {
		this.dayNames = e, this.monthNames = t, this.dayToString = n, this.combineDayAndMonth = r;
	}
	dayMonthString(e, t) {
		return this.combineDayAndMonth(this.dayToString(e), this.monthNames[t]);
	}
}, J = new ye([
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday"
], [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December"
], (e) => e === 1 ? `${e}st` : e === 2 ? `${e}nd` : e === 3 ? `${e}rd` : `${e}th`, (e, t) => `${e} of ${t}`);
//#endregion
//#region classes/time/RichDate.js
function Y() {
	return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
var X = class e {
	get toDate() {
		return /* @__PURE__ */ new Date();
	}
	get toEpochMillis() {
		return this.toDate.getTime();
	}
	get toNewDate() {
		return new Date(this.toEpochMillis);
	}
	get toJson() {
		return this.toDate.toISOString();
	}
	get toHeaderValue() {
		return this.toDate.toUTCString();
	}
	valueOf() {
		return this.toDate.valueOf();
	}
	equals(e) {
		return this.valueOf() === e.valueOf();
	}
	toString(e = J) {
		if (this.hasTime) {
			let t = this.timeZone === Y() ? "" : `(${this.timeZone})`;
			return `${this.dateStringIn(e)} ${this.timeString}${t}`;
		}
		return this.dateStringIn(e);
	}
	get dayOfWeekIndex() {
		return this.toDate.getDay();
	}
	get dayOfWeekName() {
		return this.dayOfWeekNameIn(J);
	}
	get dayOfMonth() {
		return this.toDate.getDate();
	}
	get dayOfMonthString() {
		return this.dayOfMonthStringIn(J);
	}
	get monthIndex() {
		return this.toDate.getMonth();
	}
	get monthName() {
		return this.monthNameIn(J);
	}
	get year() {
		return this.toDate.getFullYear();
	}
	get dateString() {
		return this.dateStringIn(J);
	}
	get hour() {
		return this.toDate.getHours();
	}
	get minute() {
		return this.toDate.getMinutes();
	}
	get second() {
		return this.toDate.getSeconds();
	}
	get milli() {
		return this.toDate.getMilliseconds();
	}
	get hasTime() {
		return this.hour > 0 || this.minute > 0;
	}
	get timeString() {
		let e = this.minute, t = e < 10 ? `0${e}` : e.toString(), n = this.hour;
		return `${n > 12 ? n - 12 : n < 1 ? 12 : n}:${t} ${n === 0 ? "Midnight" : n === 12 ? "Noon" : n > 12 ? "PM" : "AM"}`;
	}
	get militaryTimeString() {
		let e = this.hour, t = this.minute;
		return `${e < 10 ? `0${e}` : e.toString()}:${t < 10 ? `0${t}` : t.toString()}`;
	}
	get time() {
		return q(this.hour).plus(ge(this.minute)).plus(he(this.second)).plus(K(this.milli));
	}
	get timeZone() {
		return Y();
	}
	get isInPast() {
		return this.toDate < /* @__PURE__ */ new Date();
	}
	get isInFuture() {
		return this.toDate > /* @__PURE__ */ new Date();
	}
	get durationInPast() {
		return this.until(/* @__PURE__ */ new Date());
	}
	get durationInFuture() {
		return this.since(/* @__PURE__ */ new Date());
	}
	dayOfWeekNameIn(e) {
		return e.dayNames[this.dayOfWeekIndex];
	}
	dayOfMonthStringIn(e) {
		return e.dayToString(this.dayOfMonth);
	}
	monthNameIn(e) {
		return e.monthNames[this.monthIndex];
	}
	dateStringIn(e) {
		if (this.isInPast) {
			let t = this.durationInPast.toDays;
			return t > 6 ? `${e.dayMonthString(this.dayOfMonth, this.monthIndex)} ${this.year}` : t < 2 ? `${this.dayOfWeekNameIn(e)} ${e.dayMonthString(this.dayOfMonth, this.monthIndex)}` : `${this.dayOfWeekNameIn(e)} ${e.dayMonthString(this.dayOfMonth, this.monthIndex)} ${this.year}`;
		}
		return this.durationInFuture.toDays > 6 ? this.year === (/* @__PURE__ */ new Date()).getFullYear() ? e.dayMonthString(this.dayOfMonth, this.monthIndex) : `${e.dayMonthString(this.dayOfMonth, this.monthIndex)} ${this.year}` : `${this.dayOfWeekNameIn(e)} ${e.dayMonthString(this.dayOfMonth, this.monthIndex)}`;
	}
	hasSameDateAs(e) {
		return this.dayOfMonth === e.dayOfMonth && this.monthIndex === e.monthIndex && this.year === e.year;
	}
	hasSameTimeAs(e) {
		return e instanceof G ? this.time.equals(e) : this.time.equals(e.time);
	}
	until(t) {
		return t instanceof e ? new G(t.toDate - this.toDate) : new G(t - this.toDate);
	}
	daysUntil(e) {
		return this.until(e).toDays;
	}
	since(t) {
		return t instanceof e ? new G(this.toDate - t.toDate) : new G(this.toDate - t);
	}
	daysSince(e) {
		return this.since(e).toDays;
	}
	minus(t) {
		return t instanceof e ? new G(this.toDate - t.toDate) : new G(this.toDate - t);
	}
}, Z = class e extends X {
	constructor(e = /* @__PURE__ */ new Date()) {
		super(), this._date = e instanceof Date ? e : new Date(e);
	}
	static now() {
		return new e();
	}
	static fromEpochMillis(t) {
		return typeof t == "string" ? new e(new Date(parseInt(t, 10))) : new e(new Date(t));
	}
	get toDate() {
		return this._date;
	}
	get isToday() {
		return this.hasSameDateAs(new e());
	}
	get isTomorrow() {
		return this.hasSameDateAs(new e().tomorrow);
	}
	get atBeginningOfDay() {
		return this.minus(this.time);
	}
	get atEndOfDay() {
		return this.tomorrow.atBeginningOfDay;
	}
	get tomorrow() {
		return this.plus(q(24));
	}
	get yesterday() {
		return this.minus(q(24));
	}
	hasSameDateAs(t) {
		return t instanceof X ? this.dayOfMonth === t.dayOfMonth && this.monthIndex === t.monthIndex && this.year === t.year : this.hasSameDateAs(new e(t));
	}
	hasSameTimeAs(t) {
		return t instanceof X ? this.time.equals(t.time) : t instanceof G ? this.time.equals(t) : this.hasSameTimeAs(new e(t));
	}
	plus(t) {
		return t instanceof G ? new e(new Date(this._date.getTime() + t.toMillis)) : t instanceof X ? new e(new Date(this._date.getTime() + t.toDate)) : new e(new Date(this._date.getTime() + t));
	}
	minus(t) {
		return t instanceof G ? new e(new Date(this._date.getTime() - t.toMillis)) : t instanceof X ? new G(this._date.getTime() - t.toDate) : t instanceof Date ? new G(this._date.getTime() - t) : new e(new Date(this._date.getTime() - t));
	}
	before(t) {
		return t instanceof G ? new e(this._date - t.toMillis) : t instanceof X ? new G(t.toDate - this._date) : t instanceof Date ? new G(t - this._date) : new e(this._date - t);
	}
	after(t) {
		return t instanceof G ? new e(this._date + t.toMillis) : t instanceof X ? new G(this._date - t.toDate) : t instanceof Date ? new G(this._date - t) : new e(this._date + t);
	}
}, Q = new class extends X {
	get isInPast() {
		return !1;
	}
	get isInFuture() {
		return !1;
	}
	get static() {
		return new Z(this.toDate);
	}
	get atBeginningOfDay() {
		return this.static.atBeginningOfDay;
	}
	get atEndOfDay() {
		return this.static.atEndOfDay;
	}
	plus(e) {
		return this.static.plus(e);
	}
	minus(e) {
		return this.static.minus(e);
	}
	before(e) {
		return this.static.before(e);
	}
	after(e) {
		return this.static.after(e);
	}
}();
//#endregion
//#region classes/time/Wait.js
function be(e) {
	if (e instanceof Z) return T(e);
	if (e instanceof Date) return T(new Z(e));
	if (e instanceof G) return E(e);
	if (typeof e == "number") return E(K(e));
	if (typeof e == "string") return T(new Z(e));
	throw Error(`${e} is not a valid wait target`);
}
var xe = class e {
	constructor(e, t = !1) {
		this.target = be(e), this.started = t ? m(Z.now()) : p, this.activeWaits = S.empty;
	}
	static start(t) {
		return new e(t, !0);
	}
	get isActive() {
		return this.target.match((e) => this.started.exists((t) => t.plus(e).isInFuture), (e) => e.isInFuture);
	}
	get isCompleted() {
		return !this.isActive;
	}
	get targetTime() {
		return this.target.match((e) => this.started.match((t) => t.plus(e), () => Q.plus(e)), (e) => e);
	}
	get remaining() {
		return this.targetTime.durationInFuture;
	}
	then(e) {
		(this.started.isEmpty || this.isCompleted) && (this.started = m(Z.now()));
		let t = this.remaining;
		if (t.isPositive) {
			let n = this;
			return new Promise((r, i) => {
				let a = setTimeout(() => {
					let t = typeof e == "function" ? e() : e;
					Promise.resolve(t).then((e) => r(e), (e) => i(e)).finally(() => n.activeWaits = n.activeWaits.filterNot((e) => e.first === a));
				}, t.toMillis);
				n.activeWaits = n.activeWaits.plusOne(new w(a, i));
			});
		}
		return Promise.resolve(typeof e == "function" ? e() : e);
	}
	cancel() {
		let e = this.activeWaits;
		return this.activeWaits = S.empty, e.foreach((e) => {
			clearTimeout(e.first), e.second(/* @__PURE__ */ Error("Wait cancelled"));
		}), e.nonEmpty;
	}
}, Se = class e {
	constructor(e, t) {
		this.interval = G.flat(e), this.action = t, this.waitId = p;
	}
	static start(t, n, r = !1) {
		let i = new e(t, n);
		return i.start(r), i;
	}
	static while(t, n, r = () => !0, i = !1) {
		return e.start(t, () => (n(), r()), i);
	}
	get isRunning() {
		return this.waitId.isDefined;
	}
	get isStopped() {
		return !this.isRunning;
	}
	start(e = !1) {
		if (this.isStopped) {
			if (e) {
				let e = this.action();
				this._checkResult(e);
			} else this._continue(this);
		}
	}
	stop() {
		this.waitId.foreach((e) => clearTimeout(e)), this.waitId = p;
	}
	_continue(e) {
		e.waitId = m(setTimeout(() => {
			let t = e.action();
			e._checkResult(t, e);
		}, e.interval.toMillis));
	}
	_checkResult(e, t = this) {
		e == null || e === !0 ? t._continue(t) : e instanceof G ? (t.interval = e, t._continue(t)) : e instanceof Z ? (t.interval = e.isInFuture ? e.minus(Q) : G.zero, t._continue(t)) : e instanceof f ? e.match((e) => t._checkResult(e), () => t.waitId = p) : e.then === void 0 ? t.waitId = p : e.then((e) => t._checkResult(e, t));
	}
};
//#endregion
//#region classes/controller/AsyncResponse.js
function Ce(e) {
	return e === 503 ? "The server is temporarily unavailable. Please wait a while and try again." : e === 501 ? "This feature  hasn't been implemented yet" : e === 405 ? "This feature is not available" : e === 404 ? "Attempted to target a non-existing resource" : e === 403 ? "Attempt rejected" : e === 401 ? "Not authorized" : e === 400 ? "Invalid request" : e >= 500 ? "Attempt failed due to a server-side problem" : "Attempt failed";
}
var we = class e {
	constructor(e) {
		this.wrapped = e;
	}
	static resolve(t) {
		return new e(Promise.resolve(t));
	}
	static reject(t) {
		return new e(Promise.reject(t));
	}
	get success() {
		let e = this;
		return this.wrapped.then((t) => e._handleResponse(t));
	}
	get successJson() {
		return this.success.then((e) => e.json());
	}
	get ok() {
		return this.wrapped.ok;
	}
	then(e = (e) => e, t = function(e) {
		throw e;
	}) {
		return this.wrapped.then(e, t);
	}
	catch(e) {
		return this.wrapped.catch(e);
	}
	text() {
		return this.wrapped.text();
	}
	handleStatuses(e, t) {
		let n = this;
		return this.wrapped.then((r) => e.get(r.status).match((e) => e(r), () => n._handleResponse(r).then((e) => t(e))));
	}
	handleStatus(e, t, n) {
		let r = this;
		return this.wrapped.then((i) => i.status === e ? t(i) : r._handleResponse(i).then((e) => n(e)));
	}
	_handleResponse(e) {
		if (e instanceof Response) return e.ok ? Promise.resolve(e) : e.text().then((e) => new f(e)).catch(() => p).then((t) => t.match((e) => {
			throw Error(e);
		}, () => {
			throw Error(Ce(e.status));
		}));
		throw console.log(`Asyncresponse wrapping type: ${typeof e}`), console.log(e), Error("AsyncResponse wrapping a non-response promise");
	}
}, Te = class e {
	constructor(e, t = p) {
		this._makeRequest = e, this._cacheDuration = f.flat(t), this._cached = p, this._cacheTime = p, this._invalidated = !1;
	}
	static from(t, n, r = (e) => e, i = p, a = !1) {
		return new e((e, i) => {
			let o = Z.now();
			return i.filter(() => a).match((i) => t.getJsonIfModified(n, e).then((e) => e.match((e) => {
				let t = r(e);
				return t instanceof w && t.second instanceof Z ? t : new w(t, o);
			}, () => new w(i, o))), () => t.getJson(n).then((e) => r(e)));
		}, i);
	}
	get cached() {
		return this._cached;
	}
	get validCached() {
		if (this._invalidated) return p;
		{
			let e = this;
			return this._cached.filter(() => e._cacheDuration.forall((t) => e._cacheTime.exists((e) => e.plus(t).isInFuture)));
		}
	}
	get value() {
		let e = this;
		return this.validCached.match((e) => Promise.resolve(e), () => e._requestNew().catch((t) => e._cached.match((e) => (console.log(t), e), () => {
			throw t;
		})));
	}
	set value(e) {
		this._store(e);
	}
	modify(e) {
		this._cached = f.flat(e(this._cached));
	}
	invalidate() {
		this._invalidated = !0;
	}
	refresh() {
		this._requestNew();
	}
	clear() {
		this._cached = p, this._cacheTime = p;
	}
	_store(e, t = Z.now()) {
		return this._invalidated = !1, this._cached = m(e), this._cacheTime = m(t), e;
	}
	_requestNew() {
		let e = this;
		return this._makeRequest(this._cacheTime, this._cached).then((t) => t instanceof w && t.second instanceof Z ? e._store(t.first, t.second) : e._store(t));
	}
}, $ = class e {
	constructor(e, t = p) {
		this._value = e, this._expires = f.flat(t);
	}
	static expiring(t, n) {
		return new e(t, m(n));
	}
	static withDuration(t, n) {
		return new e(t, m(Q + n));
	}
	static persisting(t) {
		return new e(t);
	}
	get value() {
		return this._value;
	}
	get expires() {
		return this._expires;
	}
	get isValid() {
		return this._expires.forall((e) => e.isInFuture);
	}
	get isExpired() {
		return !this.isValid;
	}
	valueOf() {
		return this._value;
	}
	equals(e) {
		return this._value === e._value;
	}
}, Ee = class e {
	constructor(e) {
		this._tokenCache = me.async(e);
	}
	static failure = new e(() => Promise.reject(/* @__PURE__ */ Error("Not authorized")));
	static persistingToken(t) {
		return new e($.persisting(t));
	}
	static combo(t, n) {
		return new e(() => t.token.catch((e) => n.token.catch(() => {
			throw e;
		})));
	}
	static stored(t, n = "sessionToken", r = p, i = e.failure) {
		let a = f.flat(r);
		t.registerSlot(n), a.foreach((e) => t.registerDate(e));
		let o = new e(() => t.option(n).match((e) => new $(e, a.flatMap((e) => t.option(e))), () => Promise.reject(/* @__PURE__ */ Error("No authorization available"))));
		function s() {
			return i.token.then((e) => (t.set(n, m(e.value)), a.foreach((n) => t.set(n, e.expires)), e));
		}
		return e.combo(o, new e(s));
	}
	static temporaryToken(t, n, r = e.failure) {
		let i = n instanceof Z ? n : Q.plus(n);
		return new e(() => Q < i ? $.expiring(t, i) : r.token);
	}
	static request(t, n) {
		return new e(() => t().then((e) => e.ok ? n(e) : e.text().catch(() => "").then((t) => {
			throw !t || t.length === 0 ? e.status === 401 ? Error("Email and password don't match") : e.status >= 500 ? Error("This service is not currently working correctly") : Error("Failed to authenticate") : Error(t);
		})));
	}
	static requestTokenString(t, n = p) {
		let r = f.flat(n);
		return e.request(t, (e) => e.text().then((e) => new $(e.replace(/"/g, ""), r.map((e) => Q.plus(e)))));
	}
	static basic(t, n, r, i = p, a = "simple") {
		return e.requestTokenString(() => fetch(r, { headers: {
			Authorization: "Basic " + window.btoa(unescape(encodeURIComponent(t + ":" + n))),
			"X-Style": a
		} }), i);
	}
	static refresh(t, n, r = p, i = "simple") {
		return e.requestTokenString(() => t.token.then((e) => fetch(n, { headers: {
			Authorization: "Bearer " + e,
			"X-Style": i
		} })), r);
	}
	get isAuthorized() {
		return this._tokenCache.current.exists((e) => e.success.exists((e) => e.isValid));
	}
	get token() {
		return this._tokenCache.current.exists((e) => e.isFailure || e.success.exists((e) => e.isExpired)) && this._tokenCache.reset(), this._tokenCache.value.mapSuccess((e) => e.isExpired ? P(/* @__PURE__ */ Error("Expired session")) : F(e));
	}
	withBackup(t) {
		return t instanceof e ? e.combo(this, t) : e.combo(this, new e(t));
	}
}, De = class {
	constructor(e, t = Ee.failure, n = new pe(p), r = p) {
		this._base = e, this._session = t, this._authFailureHandler = f.flat(r), this.languagePointer = n;
	}
	get rootPath() {
		return this._base;
	}
	get isSessionOpen() {
		return this._session.isAuthorized;
	}
	get authorizationHeader() {
		return this._session.token.then((e) => "Bearer " + e);
	}
	get language() {
		return this.languagePointer.value;
	}
	set language(e) {
		this.languagePointer.value = f.flat(e);
	}
	setAuthorization(e) {
		this._session = e;
	}
	setAuthFailureHandler(e) {
		this._authFailureHandler = m(e);
	}
	testAuthorization() {
		return this._session.token.then((e) => e.isValid, () => !1);
	}
	requestWithoutAuthorization(e, t = "GET", n = p, r = {}, i = "simple") {
		let a = this, o = f.flat(n), s = {
			"X-Style": i,
			...r
		};
		return o.nonEmpty && (s["Content-Type"] = "application/json; charset=UTF-8"), f.flat(this.language).foreach((e) => {
			typeof e == "string" ? s["Accept-Language"] = e : s["X-Accept-Language-Ids"] = e;
		}), new we(fetch(a._base + e, {
			method: t,
			headers: s,
			body: o.map((e) => JSON.stringify(e)).value
		}));
	}
	request(e, t = "GET", n = p, r = {}, i = "simple") {
		let a = this, o = this.authorizationHeader.catch((e) => {
			throw this._authFailureHandler.foreach((t) => t(e)), e;
		}).then((o) => {
			let s = {
				Authorization: o,
				...r
			};
			return a.requestWithoutAuthorization(e, t, n, s, i).then((e) => (e.status === 401 && this._authFailureHandler.foreach((t) => t(e)), e));
		});
		return we.resolve(o);
	}
	get(e, t = {}, n = "simple") {
		return this.request(e, "GET", p, t, n);
	}
	getJson(e, t = {}, n = "simple") {
		return this.get(e, t, n).successJson;
	}
	getJsonIfModified(e, t, n = {}, r = "simple") {
		let i = new f(t).flatten.match((e) => n == null ? { "If-Modified-Since": e.toHeaderValue } : {
			"If-Modified-Since": e.toHeaderValue,
			...n
		}, () => n);
		return this.get(e, i, r).then((e) => {
			if (e.status === 304) return p;
			if (e.ok) return e.json().then((e) => m(e));
			throw Error(e.status.toString());
		});
	}
	push(e, t = {}, n = "POST", r = {}, i = "simple") {
		return this.request(e, n, t, r, i);
	}
	delete(e, t = {}) {
		return this.request(e, "DELETE", {}, t);
	}
}, Oe = class {
	constructor(e, t = (e) => e, n = (e) => e.valueOf()) {
		this.name = e, this.fromValue = t, this.toValue = n, this._current = null;
	}
	get value() {
		return this._current === null && (this._current = this.fromValue(localStorage[this.name])), this._current;
	}
	set value(e) {
		this._current = e;
		let t = this.toValue(e);
		t == null ? localStorage.removeItem(this.name) : localStorage[this.name] = t;
	}
}, ke = class e {
	constructor(e = !0, t = S.empty) {
		this.allowStore = e, this.slots = S.flat(t), this.nonStored = M.empty;
	}
	static enabled(t = S.empty) {
		return new e(!0, t);
	}
	static disabled(t = S.empty) {
		return new e(!1, t);
	}
	get storingEnabled() {
		return this.allowStore;
	}
	set storingEnabled(e) {
		e ? this.enableStoring() : this.disableStoring();
	}
	get(e) {
		return this.nonStored.get(e).orElse(() => this.getSlot(e).map((e) => e.value));
	}
	apply(e) {
		return this.nonStored.get(e).getOrElse(() => this.getSlot(e).match((e) => e.value, () => p));
	}
	option(e) {
		return this.get(e).flatten;
	}
	vector(e) {
		return this.get(e).match((e) => S.flat(e), () => S.empty);
	}
	set(e, t) {
		this.allowStore ? this.getSlot(e).match((e) => e.value = t, () => this.nonStored = this.nonStored.plus(e, t)) : this.nonStored = this.nonStored.plus(e, t);
	}
	containsSlot(e) {
		return this.slots.exists((t) => t.name === e);
	}
	contains(e) {
		return this.containsSlot(e) || this.nonStored.containsKey(e);
	}
	containsNonEmpty(e) {
		return this.nonStored.get(e).orElse(() => this.getSlot(e).map((e) => e.value)).exists((e) => {
			let t = e.nonEmpty;
			return t === void 0 ? e != null : t;
		});
	}
	getSlot(e) {
		return this.slots.find((t) => t.name === e);
	}
	enableStoring() {
		if (!this.allowStore) {
			this.allowStore = !0;
			let e = this.nonStored.flatMap((e, t) => this.getSlot(e).match((n) => (n.value = t, m(e)), () => p));
			this.nonStored = this.nonStored.minus(e);
		}
	}
	disableStoring() {
		this.allowStore && (this.allowStore = !1, this.nonStored = this.nonStored.plus(this.slots.map((e) => new w(e.name, e.value))));
	}
	register(e) {
		this.slots = this.slots.plus(e);
	}
	registerSlot(e, t = (e) => e, n = (e) => e.valueOf()) {
		this.slots.forall((t) => t.name !== e) && this.register(new Oe(e, t, n));
	}
	registerOption(e) {
		this.registerSlot(e, (e) => new f(e), (e) => e.value);
	}
	registerVector(e) {
		this.registerSlot(e, (e) => new f(e).match((e) => new S(JSON.parse(e)), () => S.empty), (e) => JSON.stringify(e.toArray));
	}
	registerDict(e) {
		this.registerSlot(e, (e) => new f(e).match((e) => new M(JSON.parse(e)), () => M.empty), (e) => e.toJson);
	}
	registerDate(e) {
		this.registerSlot(e, (e) => new f(e).map((e) => Z.fromEpochMillis(e)), (e) => f.flat(e).map((e) => e.toEpochMillis).value);
	}
}, Ae = class e {
	constructor(e = null, t = !1) {
		this._value = f.flat(e), this.isRequired = t, this.flag = !1;
	}
	static filled(t, n = !1) {
		return new e(f.some(t), n);
	}
	static empty(t = !1) {
		return new e(f.none, t);
	}
	get value() {
		return this._value;
	}
	set value(e) {
		this._value = f.flat(e), this.flag && this.nonEmpty && (this.flag = !1);
	}
	get text() {
		return this.value.getOrElse(() => "");
	}
	set text(e) {
		this.value = new f(e);
	}
	get isEmpty() {
		return this.value.isEmpty;
	}
	get nonEmpty() {
		return !this.isEmpty;
	}
	clear() {
		this.value = f.none;
	}
	test() {
		return this.flag = this.isRequired && this.isEmpty, !this.flag;
	}
};
//#endregion
export { De as Api, t as ArrayBuilder, ie as ArrayIterator, se as ArrayWrapper, we as AsyncResponse, Ee as Authorization, e as Builder, n as BuilderWrapper, I as ChangeEvent, ye as DateLocalizationContext, ke as DeviceStorage, M as Dict, ce as DictBuilder, G as Duration, oe as Either, a as EmptyIterator, P as Failure, Ae as Field, te as FunctionalIterator, ee as InfiniteIterator, r as Iterable, h as IterableWithOption, d as Iterator, g as IteratorWithOption, re as IteratorWithOptionWrapper, s as IteratorWrapper, me as Lazy, E as Left, Se as Loop, l as MappingIterator, le as MultiDictBuilder, p as None, Q as Now, f as Option, w as Pair, pe as Pointer, v as Range, _ as RangeIterator, Te as Resource, Z as RichDate, T as Right, y as Seq, o as SingleItemIterator, m as Some, R as Stateful, L as StatefulPromise, Oe as StorageSlot, F as Success, $ as Token, N as Try, S as Vector, C as VectorBuilder, xe as Wait, _e as days, de as divideBy, ue as divideWith, J as englishDateContext, q as hours, Y as localTimeZone, K as millis, ge as minutes, fe as paired, he as seconds, ve as weeks };

//# sourceMappingURL=index.js.map