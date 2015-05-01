
import Immutable from 'immutable';
import {Store, Observer} from '../src/ImmutableDataStore';


describe('ImmutableDataStore specs', ()=>{

    it('should get deep structures', ()=>{

        const schema = {a: {b: {c: 1}}};

        const immutableStore = new Store(schema);

        expect(immutableStore.get('a.b.c')).to.equal(1);
    });


    it('should set deep structures', ()=>{

        const schema = {a: {b: {c: 1}}};

        const immutableStore = new Store(schema);

        immutableStore.set('a.b.c', 2);

        expect(immutableStore.get('a.b.c')).to.equal(2);
    });

    it('should trigger change event for value change', ()=>{

        const schema = {a: {b: {c: 1}}};

        const immutableStore = new Store(schema);

        const path = 'a.b.c';

        const spy = sinon.spy();

        immutableStore.on('change', spy);

        immutableStore.set(path, 2);

        spy.should.have.been.called;
    });

    it('shouldnt trigger change event', ()=>{

        const schema = {a: {b: {c: 1}}};

        const immutableStore = new Store(schema);

        const path = 'a.b';

        const spy = sinon.spy();

        immutableStore.on('change', spy);

        immutableStore.set(path, {c: 1});

        spy.should.not.have.been.called;
    });


    it('should trigger change event for iterable change', ()=>{

        const schema = {a: {b: {c: [1, 2, 3], d:[1, 1]}}};

        const immutableStore = new Store(schema);

        const path = 'a.b';

        const spy = sinon.spy();

        immutableStore.on('change', spy);

        immutableStore.update(path, (ab)=> ab.mergeDeep(Immutable.fromJS({c: [1, 4, 3], d: [1, 1, 2]})));

        spy.should.have.been.called;

        spy.reset();

        immutableStore.update('a.b.d', (abd)=> abd.push(2));

        spy.should.have.been.called;
    });

    it('should save the history', ()=>{

        const schema = {a: {b: {c: [1, 2, 3]}}};

        const immutableStore = new Store(schema);

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

        const immutableStore = new Store(schema);

        const observer = new Observer(immutableStore);

        const spy = sinon.spy();

        observer.observe().forEach(spy);

        immutableStore.update('a.b.c', (data)=> data.set(1, 3));

        spy.should.have.been.called;
    });

    it('should call the path observer', ()=>{

        const schema = {a: {b: {c: [1, 2, 3]}}};

        const immutableStore = new Store(schema);

        const observer = new Observer(immutableStore);

        const path = 'a.b.c';

        const spy = sinon.spy();

        observer.observe('a.b').forEach(spy);

        immutableStore.update('a.b.c', (data)=> data.set(1, 3));

        spy.should.have.been.called;
    });


});