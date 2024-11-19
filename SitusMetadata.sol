// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import {Base64} from "base64-sol/base64.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ISitusMetadataStore} from "./interfaces/ISitusMetadataStore.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {strings} from "../lib/strings.sol";

/// @title SITUS Metadata contract
/// @author TMO (adapted from Tempe Techie)
/// @notice Contract that stores metadata for SITUS OG contracts.
contract SitusMetadata is ISitusMetadataStore {
    mapping(address => string) public descriptions; // TLD-specific descriptions, mapping(tldAddress => description)
    mapping(address => string) public brands; // TLD-specific brand names, mapping(tldAddress => brandName)

    // EVENTS
    event BrandChanged(address indexed user, string brand);
    event DescriptionChanged(address indexed user, string description);

    error NotTLDOwner();

    // READ
    // solhint-disable-next-line no-unused-vars
    function getMetadata(
        address _tldAddress,
        string calldata _domainName,
        string calldata _tld,
        uint256 _tokenId
    ) public view returns (string memory) {
        return string(
            abi.encodePacked(
                "https://ensitus.xyz/api/metadata/",
                Strings.toHexString(uint160(_tldAddress)),
                "/",
                Strings.toString(_tokenId)
            )
        );
    }

    function getTldOwner(address _tldAddress) public view returns (address) {
        Ownable tld = Ownable(_tldAddress);
        return tld.owner();
    }

    // WRITE (TLD OWNERS)

    /// @notice Only TLD contract owner can call this function.
    function changeBrand(address _tldAddress, string calldata _brand) external {
        if (msg.sender != getTldOwner(_tldAddress)) revert NotTLDOwner();
        brands[_tldAddress] = _brand;
        emit BrandChanged(msg.sender, _brand);
    }

    /// @notice Only TLD contract owner can call this function.
    function changeDescription(address _tldAddress, string calldata _description) external {
        if (msg.sender != getTldOwner(_tldAddress)) revert NotTLDOwner();
        descriptions[_tldAddress] = _description;
        emit DescriptionChanged(msg.sender, _description);
    }
} 