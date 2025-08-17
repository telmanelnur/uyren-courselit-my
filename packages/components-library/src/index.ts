// import "./styles.css";


// // TODO: Rename Menu2, Dialog2 to Menu and Dialog respectively.

import AdminWidgetPanel from "./admin-widget-panel";
import Button from "./button";
import CircularProgress from "./circular-progress";
import ColorSelector from "./color-selector";
import CourseItem from "./course-item";
import Dialog2 from "./dialog2";
import Form from "./form";
import FormField from "./form-field";
import FormSubmit from "./form-submit";
import IconButton from "./icon-button";
import LessonIcon from "./lesson-icon";
import Link from "./link";
import MediaSelector from "./media-selector";
import { MediaBrowserNiceDialog, showMediaBrowser } from "./media-browser";
export * from "./nice-modal";
import MenuItem from "./menu-item";
import Menu2 from "./menu2";
import PriceTag from "./pricetag";
import Section from "./section";
import TextRenderer from "./text-renderer";
import Chip from "./chip";
import Modal from "./modal";
// import Toast from "./toast";
import Switch from "./switch";
import Checkbox from "./checkbox";
import Table, { TableBody, TableHead, TableRow } from "./table";
import Tabs from "./tabs";
import Breadcrumbs from "./breadcrumbs";
import Popover from "./popover";
import ScrollArea from "./scrollarea";
import ComboBox from "./combo-box";
import ComboBox2 from "./combo-box2";
// import ContentPaddingSelector from "./content-padding-selector";
// import PageBuilderSlider from "./page-builder-slider";
import PageBuilderPropertyHeader from "./page-builder-property-header";
// import CssIdField from "./css-id-field";
import Select from "./select";
import getSymbolFromCurrency from "currency-symbol-map";
import Tooltip from "./tooltip";
import DragAndDrop from "./drag-and-drop";

export { Button as Button2 } from "@workspace/ui/components/button";
// export * from "./menu";

// export * from "./toast2";
export * from "./content-card";
export * from "./paginated-table";
export * from "./skeleton-card";
// export * from "./video-with-preview";
export * from "./image";
// export * from "./vertical-padding-selector";
// export * from "./max-width-selector";

export {
  AdminWidgetPanel,
  Button,
  CircularProgress,
  ColorSelector,
  // WidgetHelpers,
  CourseItem,
  Dialog2,
  Form,
  FormField,
  FormSubmit,
  getSymbolFromCurrency,
  IconButton,
  LessonIcon,
  Select,
  Link,
  MediaSelector,
  MediaBrowserNiceDialog,
  showMediaBrowser,
  Menu2,
  MenuItem,
  PageBuilderPropertyHeader,
  PriceTag,
  Section,
  Chip,
  Modal,
  //     Toast,
  Switch,
  Checkbox,
  Tabs as Tabbs,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Breadcrumbs,
  Popover,
  ScrollArea,
  ComboBox,
  TextRenderer,
  Tooltip,
  DragAndDrop,
  ComboBox2,
};

export * from "./hooks/use-toast";
export * from "./hooks/user-debounce";
