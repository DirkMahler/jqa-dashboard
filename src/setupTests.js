import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

var localStorageMock = (function() {
    var store = {};
    return {
        getItem: function(key) {
            return store[key];
        },
        setItem: function(key, value) {
            store[key] = value.toString();
        },
        clear: function() {
            store = {};
        },
        removeItem: function(key) {
            delete store[key];
        }
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'testrun', { value: true });

localStorage.setItem('connectionString', 'bolt://localhost');
localStorage.setItem('username', 'neo4j');
localStorage.setItem('password', 'Test123.');
localStorage.setItem('projectName', '###jest-test###');

configure({ adapter: new Adapter() });
