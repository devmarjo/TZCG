// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimeZoneWidget } from '../src';
vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });
it('adiciona por teclado, mantém as cidades ao alternar e impede duplicatas', async () => {
  const user = userEvent.setup();
  render(<TimeZoneWidget/>);
  const search = screen.getByRole('combobox');
  await user.type(search,'GRU');
  await user.keyboard('{ArrowDown}{Enter}');
  expect(screen.getByText('GRU')).toBeTruthy();
  await user.click(screen.getByRole('tab',{name:/Grid/}));
  expect(screen.getByText('GRU')).toBeTruthy();
  expect(screen.getAllByRole('row')).toHaveLength(3);
  const table = screen.getByRole('table');
  expect(within(table).getAllByRole('cell')).toHaveLength(48);
  await user.type(search,'GRU');
  await user.keyboard('{ArrowDown}{Enter}');
  expect(screen.getByRole('status').textContent).toContain('já está');
  expect(screen.getAllByRole('row')).toHaveLength(3);
});
it('permite alternar abas por teclado', async () => {
  const user = userEvent.setup(); render(<TimeZoneWidget/>);
  screen.getByRole('tab',{name:/Lista/}).focus();
  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('tab',{name:/Grid/}).getAttribute('aria-selected')).toBe('true');
});
it('reordena o local, impede sua exclusão e preserva ordem e exclusão no Grid', async () => {
  const user = userEvent.setup(); const changed = vi.fn(), ordered = vi.fn();
  const a = {id:'a',name:'Cidade A',timeZone:'UTC'}, b = {id:'b',name:'Cidade B',timeZone:'Europe/London'};
  const {container}=render(<TimeZoneWidget initialLocations={[a,b]} onLocationsChange={changed} onOrderChange={ordered}/>);
  const rowIds=()=>Array.from(container.querySelectorAll('[data-tzcg-row]')).map(row=>row.getAttribute('data-tzcg-row'));
  const localHandle=within(container.querySelector('[data-tzcg-row="__local"]') as HTMLElement).getByRole('button');
  localHandle.focus(); await user.keyboard('{ArrowDown}{ArrowDown}');
  expect(rowIds()).toEqual(['a','b','__local']);
  expect(ordered).toHaveBeenLastCalledWith(['a','b','__local']);
  expect(within(container.querySelector('[data-tzcg-row="__local"]') as HTMLElement).queryByRole('button',{name:/Excluir/})).toBeNull();
  await user.click(screen.getByRole('button',{name:'Excluir Cidade A'}));
  expect(rowIds()).toEqual(['b','__local']);
  expect(changed).toHaveBeenLastCalledWith([b]);
  await user.click(screen.getByRole('tab',{name:/Grid/}));
  expect(rowIds()).toEqual(['b','__local']);
  expect(screen.getByText('Local')).toBeTruthy();
});

it('restaura adições, exclusões e a posição do local depois de remontar', async () => {
  const user = userEvent.setup();
  const a = {id:'a',name:'Cidade A',timeZone:'UTC'}, b = {id:'b',name:'Cidade B',timeZone:'Europe/London'};
  const first = render(<TimeZoneWidget initialLocations={[a,b]}/>);
  within(first.container.querySelector('[data-tzcg-row="__local"]') as HTMLElement).getByRole('button').focus();
  await user.keyboard('{ArrowDown}{ArrowDown}');
  await user.click(screen.getByRole('button',{name:'Excluir Cidade A'}));
  await user.type(screen.getByRole('combobox'),'GRU');
  await user.keyboard('{ArrowDown}{Enter}');
  const expected = Array.from(first.container.querySelectorAll('[data-tzcg-row]')).map(row=>row.getAttribute('data-tzcg-row'));
  first.unmount();
  const second = render(<TimeZoneWidget initialLocations={[a,b]}/>);
  expect(Array.from(second.container.querySelectorAll('[data-tzcg-row]')).map(row=>row.getAttribute('data-tzcg-row'))).toEqual(expected);
  expect(screen.queryByText('Cidade A')).toBeNull();
  expect(screen.getByText('GRU')).toBeTruthy();
});
it('preserva lista vazia e isola chaves diferentes', () => {
  localStorage.setItem('empty',JSON.stringify({version:1,locations:[],order:['__local']}));
  const props={initialLocations:[{id:'a',name:'Cidade A',timeZone:'UTC'}]};
  const first = render(<TimeZoneWidget {...props} storageKey="empty"/>);
  expect(screen.queryByText('Cidade A')).toBeNull();first.unmount();
  render(<TimeZoneWidget {...props} storageKey="other"/>);
  expect(screen.getByText('Cidade A')).toBeTruthy();
});
it('continua utilizável com armazenamento inválido ou bloqueado', async () => {
  localStorage.setItem('tzcg:locations:v1','{invalid');
  const first = render(<TimeZoneWidget/>);expect(screen.getByText('Local')).toBeTruthy();first.unmount();
  vi.spyOn(Storage.prototype,'getItem').mockImplementation(()=>{throw new Error('blocked');});
  vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error('full');});
  const user=userEvent.setup();render(<TimeZoneWidget/>);
  await user.type(screen.getByRole('combobox'),'GRU');await user.keyboard('{ArrowDown}{Enter}');
  expect(screen.getByText('GRU')).toBeTruthy();
});
it('permite desativar persistência sem tocar no armazenamento', async () => {
  const get=vi.spyOn(Storage.prototype,'getItem'),set=vi.spyOn(Storage.prototype,'setItem');
  const user=userEvent.setup();render(<TimeZoneWidget storageKey={null}/>);
  await user.type(screen.getByRole('combobox'),'GRU');await user.keyboard('{ArrowDown}{Enter}');
  expect(get).not.toHaveBeenCalled();expect(set).not.toHaveBeenCalled();
});
