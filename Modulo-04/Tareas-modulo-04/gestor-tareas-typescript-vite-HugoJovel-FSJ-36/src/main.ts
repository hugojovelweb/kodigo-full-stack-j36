import './style.css';
import { App } from './app/App';
import { qs } from './utils/dom';

const root = qs<HTMLDivElement>('#app');
new App(root).mount();
