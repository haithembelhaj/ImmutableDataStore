
import {ImmutableDataStore, Observer} from '../src/ImmutableDataStore';


describe('ImmutableDataStore specs', ()=>{

    it('should get deep structures', ()=>{

        const schema = {a: {b: {c: 1}}};

        const immutableStore = new ImmutableDataStore(schema);

        expect(immutableStore.get('a.b.c')).to.equal(1);
    });


    it('should set deep structures', ()=>{

        const schema = {a: {b: {c: 1}}};

        const immutableStore = new ImmutableDataStore(schema);

        immutableStore.set('a.b.c', 2);

        expect(immutableStore.get('a.b.c')).to.equal(2);
    });

    it('should trigger change event for value change', ()=>{

        const schema = {a: {b: {c: 1}}};

        const immutableStore = new ImmutableDataStore(schema);

        const path = 'a.b.c';

        const spy = sinon.spy();

        immutableStore.on('change', spy);

        immutableStore.set(path, 2);

        spy.should.have.been.called;

        expect(spy.lastCall.args[0]).include(path);
    });


    it('should trigger change event for iterable change', ()=>{

        const schema = {a: {b: {c: [1, 2, 3]}}};

        const immutableStore = new ImmutableDataStore(schema);

        const path = 'a.b.c';

        const spy = sinon.spy();

        immutableStore.on('change', spy);

        immutableStore.set(path, immutableStore.get(path).set(1, 3));

        spy.should.have.been.called;

        expect(spy.lastCall.args[0]).include(path);
        expect(spy.lastCall.args[0]).include(path+'.1');

        immutableStore.set(path, immutableStore.get(path).push(4));

        expect(spy.lastCall.args[0]).include(path);

    });

    it('should save the history', ()=>{

        const schema = {a: {b: {c: [1, 2, 3]}}};

        const immutableStore = new ImmutableDataStore(schema);

        const path = 'a.b.c';

        immutableStore.set(path, immutableStore.get(path).set(1, 3));

        expect(immutableStore.get(path+'.1')).to.equal(3);
        expect(immutableStore.history).to.have.length(1);
        expect(immutableStore.history[0].getIn(['a', 'b', 'c', '1'])).to.equal(2);


        immutableStore.set(path, immutableStore.get(path).set(1, 13));

        expect(immutableStore.history).to.have.length(1);
        expect(immutableStore.history[0].getIn(['a', 'b', 'c', '1'])).to.equal(3);

    });
});


describe('Observer spec', ()=>{


    it('should call the observer', ()=>{

        const schema = {a: {b: {c: [1, 2, 3]}}};

        const immutableStore = new ImmutableDataStore(schema);

        const observer = new Observer(immutableStore);

        const path = 'a.b.c';

        const spy = sinon.spy();

        observer.observe().forEach(spy);

        immutableStore.set(path, immutableStore.get(path).set(1, 3));

        spy.should.have.been.called;

        expect(spy.lastCall.args[0]).include(path);
    });

    it('should call the path observer', ()=>{

        const schema = {a: {b: {c: [1, 2, 3]}}};

        const immutableStore = new ImmutableDataStore(schema);

        const observer = new Observer(immutableStore);

        const path = 'a.b.c';

        const spy = sinon.spy();

        observer.observe('a.b').forEach(spy);

        immutableStore.set(path, immutableStore.get(path).set(1, 3));

        spy.should.have.been.called;

        expect(spy.lastCall.args[0]).include(path);
    });


});