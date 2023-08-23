import backgroundImage from '../assets/backImage.jpg';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Root() {
  const areaStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
		backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  const titleStyle: React.CSSProperties = {
		fontFamily: "Playfair Display",
    color: "#00aaff",
    fontSize: "36px",
    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
    marginBottom: "50px",
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column", // 垂直方向にボタンを配置
    alignItems: "center", // 横方向に中央揃え
    gap: "20px", // ボタン間の余白
  };

  const buttonBaseStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    width: "200px", // ボタンの幅を200pxに設定
    padding: "10px 20px",
    borderRadius: "30px",
    cursor: "pointer",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s, box-shadow 0.3s",
  };

	const disabledButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: "#ccc", // 無効なボタンの背景色を変更
    cursor: "not-allowed",
  };

  const buttonLabels: string[] = ["FREE MODE", "TRIAL MODE", "SELECT CLEANER", "SETTING"];
  const [hoveredButton, setHoveredButton] = useState<number | null>(null);

  return (
    <>
      <div id="sidebar" style={areaStyle}>
        <h1 style={titleStyle}>roomCleanerSimulator</h1>
        <div style={buttonContainerStyle}>
          {buttonLabels.map((label, index) => (
            <div key={index}>
              <Link to={`/${label.replace(/\s+/g, '-').toLowerCase()}`}>
								<button
									type="button"
									style={{
										...buttonBaseStyle,
										...((index > 0 && { ...disabledButtonStyle, cursor: "not-allowed" }) || {}),
										transform: hoveredButton === index ? "scale(1.05)" : "scale(1)",
										boxShadow: hoveredButton === index ? "0px 6px 12px rgba(0, 0, 0, 0.15)" : "0px 4px 8px rgba(0, 0, 0, 0.1)",
									}}
									disabled={index > 0}
									onMouseEnter={() => setHoveredButton(index)}
									onMouseLeave={() => setHoveredButton(null)}
								>
									{label}
								</button>
							</Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
