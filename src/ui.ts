import './ui.css';

document.getElementById('create').onclick = () => {
    const textbox1 = document.getElementById('rate') as HTMLInputElement;
    const rate = parseInt(textbox1.value, 10);
    parent.postMessage({ pluginMessage: { type: 'create-metaball', rate} }, '*')
}
  
document.getElementById('cancel').onclick = () => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
}

document.getElementById('union').onclick = () => {
    parent.postMessage({ pluginMessage: { type: 'union' } }, '*')
}

document.getElementById('rate').oninput = () => {
    const textbox1 = document.getElementById('rate') as HTMLInputElement;
    const rate = parseInt(textbox1.value, 10);
    parent.postMessage({ pluginMessage: { type: 'create-metaball', rate } }, '*')
}