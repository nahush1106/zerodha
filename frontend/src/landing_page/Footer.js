import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer style={{ backgroundColor: "rgb(250, 250, 250)" }}>
      <div className="container border-top mt-5">
        <div className="row mt-5">
          <div className="col">
            <img src="/media/images/logo.svg" style={{ width: "50%" }} alt="Logo" />
            <p>
              Demo project. Not Zerodha Broking Ltd.
            </p>
          </div>
          <div className="col">
            <p>Company</p>
            <Link to="/about">About</Link>
            <br />
            <Link to="/product">Products</Link>
            <br />
            <Link to="/pricing">Pricing</Link>
            <br />
            <a href="#" onClick={(e) => e.preventDefault()}>Referral programme</a>
            <br />
            <a href="#" onClick={(e) => e.preventDefault()}>Careers</a>
            <br />
            <a href="#" onClick={(e) => e.preventDefault()}>Zerodha.tech</a>
            <br />
            <a href="#" onClick={(e) => e.preventDefault()}>Press & media</a>
            <br />
            <a href="#" onClick={(e) => e.preventDefault()}>Zerodha cares (CSR)</a>
            <br />
          </div>
          <div className="col">
            <p>Support</p>
            <Link to="/support">Contact</Link>
            <br />
            <Link to="/support">Support portal</Link>
            <br />
            <a href="#" onClick={(e) => e.preventDefault()}>Z-Connect blog</a>
            <br />
            <a href="#" onClick={(e) => e.preventDefault()}>List of charges</a>
            <br />
            <a href="#" onClick={(e) => e.preventDefault()}>Downloads & resources</a>
            <br />
          </div>
          <div className="col">
            <p>Account</p>
            <Link to="/signup">Open an account</Link>
            <br />
            <a href="#" onClick={(e) => e.preventDefault()}>Fund transfer</a>
            <br />
            <a href="#" onClick={(e) => e.preventDefault()}>60 day challenge</a>
            <br />
          </div>
        </div>
        <div className="mt-5 text-muted" style={{ fontSize: "14px" }}>
          <p>
            This website is an educational demo project built for learning web
            development. It is not affiliated with, endorsed by, or connected
            to Zerodha Broking Ltd. or any stock broker. It is not a real
            trading platform: all accounts, money, prices and trades are
            simulated, and no real securities are bought or sold. Names, logos
            and designs of Zerodha belong to their respective owners.
          </p>

          <p>
            Please do not enter real financial information, and do not reuse a
            real password on this site.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
