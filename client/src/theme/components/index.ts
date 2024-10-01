import { merge } from 'lodash';
import Button from './MuiButton';
import Card from './MuiCard';
import LoadingButton from './MuiLoadingButton';

export default function ComponentsOverrides() {
  return merge(Button(), Card(), LoadingButton());
}
