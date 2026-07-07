import sys
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PSCC_ROOT = BASE_DIR / "PSCC-Net"

if str(PSCC_ROOT) not in sys.path:
    sys.path.insert(0, str(PSCC_ROOT))

from models.detection_head import DetectionHead
from models.NLCDetection import NLCDetection
from models.seg_hrnet import get_seg_model
from models.seg_hrnet_config import get_hrnet_cfg
from utils.config import get_pscc_args

from collections import OrderedDict
from pathlib import Path

import imageio
import numpy as np
import torch
import torch.nn as nn
import torch.nn.functional as F

from models.detection_head import DetectionHead
from models.NLCDetection import NLCDetection
from models.seg_hrnet import get_seg_model
from models.seg_hrnet_config import get_hrnet_cfg
from utils.config import get_pscc_args

BASE_DIR = Path(__file__).resolve().parent
CHECKPOINT_ROOT = PSCC_ROOT / "checkpoint"
HEATMAP_DIR = BASE_DIR / 'heatmaps'
HEATMAP_DIR.mkdir(parents=True, exist_ok=True)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
device_ids = list(range(torch.cuda.device_count())) if device.type == 'cuda' else None


def normalize_state_dict(checkpoint):
    if isinstance(checkpoint, dict):
        if 'state_dict' in checkpoint:
            checkpoint = checkpoint['state_dict']
        elif 'model' in checkpoint:
            checkpoint = checkpoint['model']
        elif 'net' in checkpoint:
            checkpoint = checkpoint['net']
    if isinstance(checkpoint, dict):
        new_state_dict = OrderedDict()
        for k, v in checkpoint.items():
            if k.startswith('module.'):
                k = k[7:]
            new_state_dict[k] = v
        return new_state_dict
    return checkpoint


def load_checkpoint(path):
    checkpoint = torch.load(str(path), map_location='cpu')
    return normalize_state_dict(checkpoint)


def load_network_weight(net, checkpoint_dir, name):
    weight_path = checkpoint_dir / f'{name}.pth'
    if not weight_path.exists():
        raise FileNotFoundError(f'Missing checkpoint: {weight_path}')
    net_state_dict = load_checkpoint(weight_path)
    net.load_state_dict(net_state_dict)


def build_model():
    args = get_pscc_args()
    cfg = get_hrnet_cfg()

    FENet = get_seg_model(cfg)
    SegNet = NLCDetection(args)
    ClsNet = DetectionHead(args)

    FENet = FENet.to(device)
    SegNet = SegNet.to(device)
    ClsNet = ClsNet.to(device)

    if device.type == 'cuda' and device_ids and len(device_ids) > 1:
        FENet = nn.DataParallel(FENet, device_ids=device_ids)
        SegNet = nn.DataParallel(SegNet, device_ids=device_ids)
        ClsNet = nn.DataParallel(ClsNet, device_ids=device_ids)

    load_network_weight(FENet, CHECKPOINT_ROOT / 'HRNet_checkpoint', 'HRNet')
    load_network_weight(SegNet, CHECKPOINT_ROOT / 'NLCDetection_checkpoint', 'NLCDetection')
    load_network_weight(ClsNet, CHECKPOINT_ROOT / 'DetectionHead_checkpoint', 'DetectionHead')

    FENet.eval()
    SegNet.eval()
    ClsNet.eval()

    return args, FENet, SegNet, ClsNet


ARGS, FENET, SEGNET, CLSNET = build_model()


def rgba2rgb(rgba, background=(255, 255, 255)):
    row, col, ch = rgba.shape
    rgb = np.zeros((row, col, 3), dtype='float32')
    r, g, b, a = rgba[:, :, 0], rgba[:, :, 1], rgba[:, :, 2], rgba[:, :, 3]
    a = np.asarray(a, dtype='float32') / 255.0
    R, G, B = background
    rgb[:, :, 0] = r * a + (1.0 - a) * R
    rgb[:, :, 1] = g * a + (1.0 - a) * G
    rgb[:, :, 2] = b * a + (1.0 - a) * B
    return np.asarray(rgb, dtype='uint8')


def preprocess_image(image_path: str):
    image = imageio.imread(str(image_path))

    if image.ndim == 2:
        image = np.stack([image] * 3, axis=-1)
    if image.shape[-1] == 4:
        image = rgba2rgb(image)
    if image.shape[-1] == 1:
        image = np.repeat(image, 3, axis=-1)

    image = torch.from_numpy(image.astype(np.float32) / 255.0).permute(2, 0, 1)
    image = image.unsqueeze(0)
    return image


import cv2


def save_heatmap(mask_tensor: torch.Tensor, image_path: str) -> str:

    # Masque prédit
    mask = mask_tensor.squeeze().cpu().numpy()

    if mask.ndim == 3:
        mask = mask[0]

    mask = (mask - mask.min()) / (mask.max() - mask.min() + 1e-8)
    mask = (mask * 255).astype(np.uint8)

    # Image originale
    original = cv2.imread(image_path)

    h, w = original.shape[:2]

    # Redimensionner le masque
    mask = cv2.resize(mask, (w, h))

    # Heatmap couleur
    heatmap = cv2.applyColorMap(mask, cv2.COLORMAP_JET)

    # Fusion image + heatmap
    overlay = cv2.addWeighted(original, 0.65, heatmap, 0.35, 0)

    heatmap_path = HEATMAP_DIR / f"{Path(image_path).stem}_heatmap.png"

    cv2.imwrite(str(heatmap_path), overlay)

    return str(heatmap_path)
    mask = mask_tensor.squeeze().cpu().numpy()
    if mask.ndim == 3 and mask.shape[0] == 1:
        mask = mask[0]

    mask = mask.astype(np.float32)
    mask = (mask - mask.min()) / (mask.max() - mask.min() + 1e-8)
    mask_uint8 = (mask * 255.0).astype(np.uint8)

    heatmap_path = HEATMAP_DIR / f'{Path(image_path).stem}.png'
    imageio.imwrite(str(heatmap_path), mask_uint8)
    return str(heatmap_path)


def analyze_pscc(image_path: str, save_heatmap_to_disk: bool = True):
    image = preprocess_image(image_path).to(device)

    with torch.no_grad():
        feat = FENET(image)
        pred_mask = SEGNET(feat)[0]
        pred_mask = F.interpolate(pred_mask, size=(image.size(2), image.size(3)), mode='bilinear', align_corners=True)
        pred_logit = CLSNET(feat)
        prob = torch.softmax(pred_logit, dim=1)
        probs = prob[0].cpu().tolist()
        binary_cls = int(prob.argmax(dim=1).item())

    manipulation = binary_cls == 1
    confidence = float(probs[binary_cls])
    authenticity = float(probs[0])
    heatmap_path = save_heatmap(pred_mask, image_path) if save_heatmap_to_disk else ''

    return {
        'manipulation': manipulation,
        'confidence': confidence,
        'authenticity': authenticity,
        'heatmap_path': heatmap_path,
    }
