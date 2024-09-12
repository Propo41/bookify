import { merge } from 'lodash';
import Button from './MuiButton';
import Card from './MuiCard';

export default function ComponentsOverrides() {
  return merge(Button(), Card());
}
