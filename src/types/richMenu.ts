export interface ActionArea {
  id: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  action: {
    type: 'uri' | 'postback' | 'message' | 'datetimepicker';
    uri?: string;
    data?: string;
    text?: string;
    displayText?: string;
    label?: string;
    mode?: 'date' | 'time' | 'datetime';
    initial?: string;
    max?: string;
    min?: string;
  };
}

export interface RichMenuTemplate {
  size: {
    width: number;
    height: number;
  };
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: ActionArea[];
}

export interface RichMenuData {
  size: {
    width: number;
    height: number;
  };
  selected: boolean;
  name: string;
  chatBarText: string;
  areas: ActionArea[];
}