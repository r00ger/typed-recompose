import React = require('react');
import test = require('blue-tape');
import recompose = require('recompose');

// GIVEN
interface StatelessCmpProps {
    bar: string;
}

const StatelessCmp: React.StatelessComponent<StatelessCmpProps> = (props: StatelessCmpProps): JSX.Element => {
    return <div>{props.bar}</div>;
};

interface CmpProps {
    nProp: number;
    sProp: string;
}
interface CmpState {
    s1: number;
    s2: string;
}
class Cmp extends React.Component<CmpProps, CmpState> {
    public render(): JSX.Element {
        return <div>{this.props.nProp}</div>;
    }
}

test('withContext', t => {
    const { withContext } = recompose;
    t.equal(typeof withContext, 'function', 'withContext is a function');

    const withContextFactory = withContext(
        { fooFn: React.PropTypes.object },
        () => ({ fooFn: () => { } })
    );

    const StatelessCmpContainsContext = withContextFactory(StatelessCmp);
    // <StatelessCmpContainsContext />
    // TS2324: Property 'bar' is missing in type ...
    <StatelessCmpContainsContext bar='' />;

    const CmpContainsContext = withContextFactory(Cmp);
    // <CmpContainsContext />
    // Property 'nProp' is missing in type ...
    // Property 'sProp' is missing in type ...
    <CmpContainsContext nProp={0} sProp='' />;

    return t.end();
});

test('mapProps', t => {
    const { mapProps } = recompose;
    t.equal(typeof mapProps, 'function', 'mapProps is a function');

    interface NeededProps {
        firstName: string;
        lastName: string;
    }

    interface MappedProps {
        fullName: string;
    }

    class FullName extends React.Component<MappedProps, void> {
        render() {
            return <div>{this.props.fullName}</div>;
        }
    }

    const propMapper = mapProps((props: NeededProps) => ({
        fullName: props.firstName + ' ' + props.lastName
    }));

    const FirstAndLastName = propMapper(FullName);
    // <FirstAndLastName />
    // {firstName|lastName} is missing in type ...
    <FirstAndLastName firstName='Ian' lastName='Ker-Seymer' />;

    return t.end();
});

test('withProps', t => {
    t.equal(typeof recompose.withProps, 'function', 'withProps is a function');

    const withPropsFactory = recompose.withProps((props: CmpProps) => ({
        sAdditionalProp: 'foo'
    }));

    const CmpWithAdditionalProp = withPropsFactory(Cmp);
    // <CmpWithAdditionalProp sProp="" nProp={0} />
    // TS2324: Property 'sAdditionalProp' is missing in type ...
    <CmpWithAdditionalProp sProp='' nProp={0} sAdditionalProp='' />;
    return t.end();
});

test('pure', t => {
    t.equal(typeof recompose.pure, 'function', 'pure is a function');

    const PureStatelessCmp = recompose.pure(StatelessCmp);
    const PureCmp = recompose.pure(Cmp);
    // <PureStatelessCmp />;
    // TS2324: Property 'bar' is missing in type ...
    <PureCmp sProp='Hello again!' nProp={0} />;

    // <PureCmp />;
    // Property 'nProp' is missing in type ...
    // Property 'sProp' is missing in type ...
    <PureStatelessCmp bar='Hi there!' />;

    return t.end();
});


test('setPropTypes', t => {
    t.equal(typeof recompose.withProps, 'function', 'withProps is a function');
    interface TheOnlyProperty {
        theOnlyProperty: string;
    }
    const setPropTypesFactory = recompose.setPropTypes({
        theOnlyProperty: React.PropTypes.string
    } as React.ValidationMap<TheOnlyProperty>);

    const CmpWithTheOnlyProperty = setPropTypesFactory(Cmp);
    // <CmpWithTheOnlyProperty />
    // Property 'theOnlyProperty' is missing in type
    <CmpWithTheOnlyProperty theOnlyProperty='' />;

    return t.end();
});

test('getContext', t => {
    t.equal(typeof recompose.getContext, 'function', 'getContext is a function');

    interface PropsFromContext {
        propFromContext: string;
    }
    const getContextFactory = recompose.getContext({
        propFromContext: React.PropTypes.string,
    });

    const CmpWithContext = getContextFactory(Cmp) as React.ComponentClass<CmpProps & PropsFromContext>;

    //  <CmpWithContext />
    //  Property 'nProp' is missing in type ...
    //  Property 'sProp' is missing in type ...
    //  Property 'propFromContext' is missing in type ...

    <CmpWithContext sProp='' nProp={0} propFromContext='' />;

    return t.end();
});

test('componentFromProp', t => {
    const Div = <div />;
    interface ButtonProps {
        component: string | JSX.Element;
    }
    t.equal(typeof recompose.componentFromProp, 'function', 'componentFromProp is a function');
    const Button = recompose.componentFromProp<ButtonProps>('component');
    <Button component='a' />;
    <Button component={Div} />;

    return t.end();
});

test('lifecyle', t => {
    t.equal(typeof recompose.lifecycle, 'function', 'lifecycle is a function');

    interface Props {
        test: boolean;
    }

    const TestCmp = (props: Props) => <div>Hello world</div>;

    const lifecycleSpec = {
        commponentWillReceiveProps:
        (nextProps: Props, nextState: void) => console.log('componentWillReceiveProps'),
        shouldComponentUpdate: (nextProps: Props, nextState: void) => true
    };

    const CmpWithLifecyle = recompose.lifecycle<Props, void>(lifecycleSpec)(TestCmp);

    <CmpWithLifecyle test />;

    t.end();
});

test('withState', t => {
    t.equal(typeof recompose.withState, 'function', 'withState is a function');
    interface ExpandedProps {
        isExpanded?: boolean;
        setExpanded?: (expanded: boolean) => void;
        // properties will be provided by recompose and thus have to be optional
    }

    function expandableFactory<TProps>(
        component: React.ComponentClass<TProps> | React.StatelessComponent<TProps>
    ) {
        return recompose.withState<TProps, ExpandedProps & TProps>(
            'isExpanded',
            'setExpanded',
            () => false
        )(component);
    }

    const ExpandableCmp = expandableFactory(Cmp);
    // <ExpandableCmp />;
    // Property 'nProp' is missing in type ...
    // Property 'sProp' is missing in type ...
    <ExpandableCmp sProp='Ola!' nProp={0} />;

    const ExpandableSFC = expandableFactory(StatelessCmp);
    // <ExpandableSFC />
    // Property 'bar' is missing in type ...
    <ExpandableSFC bar='Ola!' />;
    t.end();
});

test('shouldUpdate', t => {
    t.equal(typeof recompose.withState, 'function', 'shouldUpdate is a function');

    interface Props {
        stale: boolean;
    }

    const StaleOrFresh = (props: Props) => <div>{props.stale ? 'Stale!' : 'Fresh!'}</div>;

    const UpdateWhenStale = recompose.shouldUpdate((props: Props) => props.stale)(StaleOrFresh);

    <UpdateWhenStale stale />;

    t.end();
});

test('renameProp', t => {
    t.equal(typeof recompose.renameProp, 'function', 'renameProp is a function');

    interface FooProps {
        foo: string;
    }
    interface BarProps {
        bar: string;
    }
    const CmpWithBar = (props: BarProps) => <div> {props.bar} </div>;

    const FooToBar = recompose
        .renameProp('foo', 'bar')(CmpWithBar) as React.ComponentClass<FooProps>;
    // in this case we can't do much
    // So if wee need precise types then we have to specify it explicitly
    <FooToBar foo='some value' />;
    t.end();
});


test('renameProps', t => {
    t.equal(typeof recompose.renameProps, 'function', 'renameProps is a function');

    interface OldProps {
        foo: string;
        bar: string;
    }
    interface NewProps {
        newFoo: string;
        newBar: string;
    }
    const CmpWithNewProps = (props: NewProps) => <div> {props.newBar} {props.newFoo} </div>;

    const OldToNewProps = recompose
        .renameProp('foo', 'bar')(CmpWithNewProps) as React.ComponentClass<OldProps>;
    // in this case we can't do much
    // So if wee need precise types then we have to specify it explicitly
    <OldToNewProps foo='some foo' bar='some bar' />;
    t.end();
});
