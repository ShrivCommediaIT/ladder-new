

"use client";

import Image from "next/image";
import Link from "next/link";
import CouponForm from "./CouponForm";
import CouponLogin from "./CouponLogin";

export default function CouponInfo() {
  return (
    <div className="relative w-full min-h-screen">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/bgHome.png" // replace with your image path
          alt="Background"
          fill
          className="object-cover opacity-40" // adjust opacity here
          priority
        />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6">
        {/* ✅ Logo & Header Section */}
        <div className="flex flex-col items-center gap-3 text-center mt-6 sm:mt-8">
          <Image
            src="/coupon-icon.png"
            alt="Sports Solutions Pro"
            width={300}
            height={80}
            className="object-contain w-48 sm:w-72 md:w-80"
            priority
          />
          {/* Address & Contact Info */}
          <div className="space-y-2 sm:space-y-1 mb-6 sm:mb-8 text-gray-800">
            <p className="text-sm sm:text-base leading-relaxed">
              Richmond House, Lawnswood Business Park <br />
              Redvers Close, Leeds LS16 6QY
            </p>
            <p className="text-sm sm:text-base">
              <span className="font-semibold">Email:</span>{" "}
              <a
                href="mailto:support@sportssolutionspro.com"
                className="text-blue-600 hover:underline break-all"
              >
                support@sportssolutionspro.com
              </a>
            </p>
            <p className="text-sm sm:text-base">
              <span className="font-semibold">Tel:</span>{" "}
              <a
                href="tel:07432272573"
                className="text-blue-600 hover:underline"
              >
                07432 272573
              </a>{" "}
              <span className="text-gray-600 block sm:inline">
                (WhatsApp Business 24/7)
              </span>
            </p>
          </div>
        </div>

        {/* ✅ Title */}
        <div className="text-center py-3">
          <h1 className="font-semibold border-b-2 border-black text-2xl sm:text-3xl uppercase">
            Coupon Application
          </h1>
        </div>

        {/* ✅ Main Content */}
        <div className="text-justify flex flex-col gap-4 mt-4 text-sm sm:text-base leading-relaxed">
          <p>
            <strong>Welcome!</strong> You have arrived on our Coupon Application
            page where you can apply for a coupon which you can quote for the use
            of potential subscribers to our sports solutions material that you may
            have approached.
          </p>
          <p>
            They are all of the format <strong>ABCDE10</strong> – where “ABCDE”
            can be any letters of your choice.
          </p>
        </div>



          

            {/* ✅ List Section */}
      <div className="py-4">
        <h1 className="font-semibold text-lg sm:text-xl">
          The “10” represents:
        </h1>

        <ol className="list-decimal list-inside space-y-1 text-sm sm:text-base mt-2">
          <li>
            a 10% discount for subscribers that sign up using your coupon
          </li>
          <li>
            a commission payment to yourselves of 10% of any such subscription
            after the coupon has been applied
          </li>
        </ol>
      </div>

      {/* ✅ Instructions */}
      <div className="mt-2">
        <h1 className="font-semibold text-lg sm:text-xl">
          Please provide to admin@sportssolutionspro.com the information below,
          needed to set this up:
        </h1>

        <ol className="list-decimal list-inside space-y-1 text-sm sm:text-base mt-3">
          <li>COUPON NAME you would like in the format “ABCDE10”</li>
          <li>
            Your full name or business name that is linked with the bank account
            you would like your commissions paid into
          </li>
          <li>
            Name and full address of the bank account you would like your
            commissions paid into.
          </li>
          <li>
            Your full address that is linked to your bank account (1st, 2nd
            lines, Town/City, Postcode, Country)
          </li>
          <li>Bank Account Sort Code</li>
          <li>Bank Account Number/IBAN</li>
          <li>Swift/Bic Code</li>
        </ol>
      </div>

      {/* ✅ Closing Note */}
      <div className="py-3 space-y-1 text-sm sm:text-base">
        <p>We will confirm by email when your coupon is “LIVE”.</p>
        <p>Thank you. We very much look forward to doing business with you.</p>
        <p>
          Please don’t hesitate to contact us if you have any questions at all.
        </p>
      </div>

      {/* ✅ Signature */}
      <div className="mt-2 mb-6 text-sm sm:text-base">
        <p>Johnny Gray</p>
        <p>Admin Team Sports Solutions Pro</p>
        <p>Tel: 07432 272573</p>
      </div>

      {/* ✅ Footer */}
      <footer className="mt-10 py-8">
        <div className="max-w-5xl mx-auto text-center text-gray-700 space-y-2">
          <h2 className="text-base sm:text-lg font-semibold">
            Sports Solutions Pro – a subsidiary of NE Games Ltd
          </h2>

          <p className="text-sm sm:text-base">
            NE Games Ltd (Company No. 12345678) Registered in England & Wales
          </p>
          <p className="text-sm sm:text-base">
            Registered Office: Richmond House, Lawnswood Business Park, Redvers
            Close, Leeds LS16 6QY
          </p>

          <p className="text-sm sm:text-base mt-2">
            An{" "}
            <Link
              href="https://en.wikipedia.org/wiki/ISO_9000"
              target="_blank"
              className="text-blue-600 underline hover:text-blue-800"
            >
              ISO 9001 : 2015
            </Link>{" "}
            Certified. Designed and Developed by{" "}
            <span className="font-semibold">
              Shriv ComMedia Solutions Pvt. Ltd.
            </span>{" "}
            – Software Development Company in India.
          </p>

          <p className="text-sm sm:text-base mt-1">
            All Rights Reserved –{" "}
            <Link
              href="https://www.commediait.com"
              target="_blank"
              className="text-blue-600 underline hover:text-blue-800"
            >
              www.commediait.com
            </Link>
          </p>
        </div>
      </footer>

      </div>

    </div>
  );
}
